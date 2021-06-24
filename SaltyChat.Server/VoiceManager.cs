using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AltV.Net;
using AltV.Net.Async;
using AltV.Net.Elements.Entities;
using SaltyChat.Server.Models;
using SaltyChat.Server.Writables;

namespace SaltyChat.Server
{
    public class VoiceManager
    {
        #region Useless things.. But I like them

        private const string Version = "1.0.9"; // ToDo: Change on update

        #endregion

        #region Properties

        public static VoiceManager Instance { get; private set; }

        public static Configuration Configuration { get; private set; }

        public IEnumerable<VoiceClient> VoiceClients
        {
            get
            {
                VoiceClient[] clients;
                lock (_voiceClients)
                {
                    clients = _voiceClients.Values.ToArray();
                }

                return clients;
            }
        }

        private readonly ConcurrentDictionary<IPlayer, VoiceClient> _voiceClients = new ConcurrentDictionary<IPlayer, VoiceClient>();
        private readonly List<RadioChannel> _radioChannels = new List<RadioChannel>();

        #endregion

        #region Constructor

        public VoiceManager()
        {
            var configFile = Path.Combine(Alt.Server.RootDirectory, "resources", Alt.Server.Resource.Name, "config.json");
            if (!File.Exists(configFile)) throw new FileNotFoundException("Missing config.json");

            try
            {
                Configuration = JsonSerializer.Deserialize<Configuration>(File.ReadAllText(configFile));
                Alt.Log($"[SaltyChat] New status: enabled. Version: {Version}. Server-ID: {Configuration.ServerIdentifier}");
            }
            catch (Exception ex)
            {
                Alt.Log("[SaltyChat] Failed loading configuration from config.json: " + ex);
                Environment.FailFast("Failed loading configuration from config.json", ex);
            }

            Instance = this;
            AltAsync.OnClient<IPlayer, string>("SaltyChat:CheckVersion", OnClientCheckVersion);
            AltAsync.OnClient<IPlayer, bool>("SaltyChat:IsUsingMegaphone", OnClientIsUsingMegaphone);
            AltAsync.OnClient<IPlayer, string, bool>("SaltyChat:PlayerIsSending", OnClientPlayerIsSending);
            AltAsync.OnClient<IPlayer, float>("SaltyChat:SetRange", OnClientSetRange);
            AltAsync.OnClient<IPlayer, bool>("SaltyChat:ToggleRadioSpeaker", OnClientToggleRadioSpeaker);
            Alt.OnPlayerDisconnect += OnServerPlayerDisconnect;
            AltAsync.OnServer<IPlayer, bool>("SaltyChat:SetPlayerAlive", OnServerSetPlayerAlive);
            AltAsync.OnServer<IPlayer>("SaltyChat:EnablePlayer", OnServerEnablePlayer);
            AltAsync.OnServer<string>("SaltyChat:UpdateRadioTowers", OnServerUpdateRadioTowers);
            AltAsync.OnServer<IPlayer, string, bool>("SaltyChat:JoinRadioChannel", OnServerJoinRadioChannel);
            AltAsync.OnServer<IPlayer, string>("SaltyChat:LeaveRadioChannel", OnServerLeaveRadioChannel);
            AltAsync.OnServer<IPlayer>("SaltyChat:LeaveAllRadioChannel", OnServerLeaveAllRadioChannel);
            AltAsync.OnServer<IPlayer, IPlayer>("SaltyChat:StartCall", OnServerStartCall);
            AltAsync.OnServer<IPlayer, IPlayer>("SaltyChat:EndCall", OnServerEndCall);
        }

        #endregion

        #region Server Events

        private void OnServerPlayerDisconnect(IPlayer player, string reason)
        {
            lock (player)
            {
                Alt.EmitAllClients("SaltyChat:RemoveClient", player.Id);
                lock (_voiceClients)
                {
                    if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
                    foreach (var radioChannel in _radioChannels) radioChannel.RemoveMember(voiceClient);

                    _voiceClients.TryRemove(player, out _);
                }
            }
        }

        #endregion

        #region Client Events

        private async void OnClientCheckVersion(IPlayer player, string version)
        {
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
            }

            if (!IsVersionAccepted(version))
            {
                player.Kick($"[Salty Chat] Required plugin version: {Configuration.MinimumPluginVersion}");
            }

            await Task.CompletedTask;
        }

        private async void OnClientPlayerIsSending(IPlayer player, string radioChannelName, bool isSending)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            var radioChannel = GetRadioChannel(radioChannelName, false);
            if (radioChannel == null || !radioChannel.IsMember(voiceClient)) return;
            radioChannel.Send(voiceClient, isSending);

            await Task.CompletedTask;
        }

        private async void OnClientSetRange(IPlayer player, float range)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            if (Array.IndexOf(Configuration.VoiceRanges, range) == -1) return;
            voiceClient.VoiceRange = range;
            AltAsync.EmitAllClients("SaltyChat:UpdateClientRange", player, range);

            await Task.CompletedTask;
        }

        private async void OnClientIsUsingMegaphone(IPlayer player, bool state)
        {
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out _)) return;
                AltAsync.EmitAllClients("SaltyChat:IsUsingMegaphone", player, Configuration.MegaphoneRange, state, player.Position);
            }

            await Task.CompletedTask;
        }

        private async void OnClientToggleRadioSpeaker(IPlayer player, bool state)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            voiceClient.IsRadioSpeakerEnabled = state;

            foreach (var radioChannelMembership in GetRadioChannelMembership(voiceClient))
            {
                radioChannelMembership.RadioChannel.SetSpeaker(voiceClient, state);
            }

            await Task.CompletedTask;
        }

        #endregion

        #region Exports: State

        private async void OnServerSetPlayerAlive(IPlayer player, bool isAlive)
        {
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
                voiceClient.IsAlive = isAlive;
                AltAsync.EmitAllClients("SaltyChat:UpdateClientAlive", voiceClient.Player, isAlive);
            }

            await Task.CompletedTask;
        }

        private async void OnServerEnablePlayer(IPlayer player)
        {
            var health = await AltAsync.GetHealthAsync(player);

            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                voiceClient = new VoiceClient(player, GetTeamSpeakName(player), Configuration.VoiceRanges[1], health > 100);
                if (_voiceClients.ContainsKey(player)) _voiceClients[player] = voiceClient;
                else _voiceClients.TryAdd(player, voiceClient);
            }

            player.EmitLocked("SaltyChat:Initialize", new ClientInitData(voiceClient.TeamSpeakName));

            var voiceClients = new List<VoiceClient>();
            lock (_voiceClients)
            {
                foreach (var (key, value) in _voiceClients.Where(c => c.Key.Id != player.Id))
                {
                    voiceClients.Add(new VoiceClient(key, value.TeamSpeakName, value.VoiceRange, value.IsAlive, key.Position));
                    key.EmitLocked("SaltyChat:UpdateClient", player, voiceClient.TeamSpeakName, voiceClient.VoiceRange, voiceClient.IsAlive, player.Position);
                }
            }

            player.EmitLocked("SaltyChat:SyncClients", new ClientSyncData(voiceClients));

            await Task.CompletedTask;
        }

        #endregion

        #region Exports: Radio

        private async void OnServerUpdateRadioTowers(string radioTowersStr)
        {
            Configuration.RadioTowers = JsonSerializer.Deserialize<RadioTower[]>(radioTowersStr);
            var clientRadioTowers = new ClientRadioTowers(Configuration.RadioTowers);
            AltAsync.EmitAllClients("SaltyChat:UpdateRadioTowers", clientRadioTowers);

            await Task.CompletedTask;
        }

        private async void OnServerJoinRadioChannel(IPlayer player, string channelName, bool isPrimary)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            if (channelName != null)
            {
                JoinRadioChannel(voiceClient, channelName, isPrimary);
            }

            await Task.CompletedTask;
        }

        private async void OnServerLeaveRadioChannel(IPlayer player, string channelName)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            if (channelName != null)
            {
                LeaveRadioChannel(voiceClient, channelName);
            }

            await Task.CompletedTask;
        }

        private async void OnServerLeaveAllRadioChannel(IPlayer player)
        {
            VoiceClient voiceClient;
            lock (_voiceClients)
            {
                if (!_voiceClients.TryGetValue(player, out voiceClient)) return;
            }

            LeaveRadioChannel(voiceClient);

            await Task.CompletedTask;
        }

        #endregion

        #region Exports: Phone

        private void OnServerStartCall(IPlayer caller, IPlayer called)
        {
            caller.EmitLocked("SaltyChat:PhoneEstablish", called, called.Position);
            called.EmitLocked("SaltyChat:PhoneEstablish", caller, caller.Position);
        }

        private void OnServerEndCall(IPlayer caller, IPlayer called)
        {
            if (caller.Exists) caller.EmitLocked("SaltyChat:PhoneEnd", called.Id);
            if (called.Exists) called.EmitLocked("SaltyChat:PhoneEnd", caller.Id);
        }

        #endregion

        #region Radio: Control Methods

        private RadioChannel GetRadioChannel(string name, bool create)
        {
            RadioChannel radioChannel;

            lock (_radioChannels)
            {
                radioChannel = _radioChannels.FirstOrDefault(r => r.Name == name);
                if (radioChannel == null && create)
                {
                    radioChannel = new RadioChannel(name);
                    _radioChannels.Add(radioChannel);
                }
            }

            return radioChannel;
        }

        private async void JoinRadioChannel(VoiceClient voiceClient, string radioChannelName, bool isPrimary)
        {
            lock (_radioChannels)
            {
                if (_radioChannels.Any(c => c.Members.Any(m => m.VoiceClient == voiceClient && m.IsPrimary == isPrimary))) return;
            }

            var radioChannel = GetRadioChannel(radioChannelName, true);
            radioChannel.AddMember(voiceClient, isPrimary);

            await Task.CompletedTask;
        }

        private async void LeaveRadioChannel(VoiceClient voiceClient, string radioChannelName)
        {
            foreach (var membership in GetRadioChannelMembership(voiceClient).Where(m => m.RadioChannel.Name == radioChannelName))
            {
                membership.RadioChannel.RemoveMember(voiceClient);
                if (membership.RadioChannel.Members.Length != 0) continue;
                lock (_radioChannels)
                {
                    _radioChannels.Remove(membership.RadioChannel);
                }
            }

            await Task.CompletedTask;
        }

        private async void LeaveRadioChannel(VoiceClient voiceClient)
        {
            var memberships = GetRadioChannelMembership(voiceClient);
            foreach (var membership in memberships)
            {
                membership.RadioChannel.RemoveMember(voiceClient);
                if (membership.RadioChannel.Members.Length != 0) continue;
                lock (_radioChannels)
                {
                    _radioChannels.Remove(membership.RadioChannel);
                }
            }

            await Task.CompletedTask;
        }

        private IEnumerable<RadioChannelMember> GetRadioChannelMembership(VoiceClient voiceClient)
        {
            var memberships = new List<RadioChannelMember>();
            lock (_radioChannels)
            {
                memberships.AddRange(_radioChannels.Select(radioChannel => radioChannel.Members.FirstOrDefault(m => m.VoiceClient == voiceClient)).Where(membership => membership != null));
            }

            return memberships;
        }

        #endregion

        #region Methods: Misc

        private string GetTeamSpeakName(IPlayer player)
        {
            var name = Configuration.NamePattern;
            do
            {
                name = Regex.Replace(name, @"(\{guid\})", Guid.NewGuid().ToString().Replace("-", ""));
                name = Regex.Replace(name, @"(\{serverid\})", player.Id.ToString());
                if (name.Length > 30) name = name.Remove(29, name.Length - 30);
            } while (_voiceClients.Values.Any(c => c.TeamSpeakName == name));

            return name;
        }

        private bool IsVersionAccepted(string version)
        {
            if (!string.IsNullOrWhiteSpace(version))
            {
                try
                {
                    var minimumVersionArray = Configuration.MinimumPluginVersion.Split(".");
                    var currentVersionArray = version.Split(".");
                    var lengthCounter = currentVersionArray.Length >= minimumVersionArray.Length ? currentVersionArray.Length : minimumVersionArray.Length;
                    for (var i = 0; i < lengthCounter; i++)
                    {
                        var min = Convert.ToInt32(minimumVersionArray[i]);
                        var cur = Convert.ToInt32(currentVersionArray[i]);
                        if (cur > min) return true;
                        if (cur < min) return false;
                    }
                }
                catch
                {
                    return false;
                }
            }
            else
            {
                return false;
            }

            return true;
        }

        #endregion
    }
}