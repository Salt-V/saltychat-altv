using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AltV.Net;
using AltV.Net.Elements.Entities;
using SaltyChat.Server.Models;
using SaltyChat.Server.Writables;

namespace SaltyChat.Server
{
    public class VoiceManager
    {
        #region Properties

        public static VoiceManager Instance { get; private set; }

        public static Configuration Configuration { get; private set; }

        public IEnumerable<VoiceClient> VoiceClients => _voiceClients.Values;

        private readonly Dictionary<IPlayer, VoiceClient> _voiceClients = new();
        private readonly List<PhoneCall> _phoneCalls = new();
        private readonly List<RadioChannel> _radioChannels = new();
        private const string _Version = "1.2.1"; // ToDo: Change on update

        #endregion

        #region Constructor

        public VoiceManager()
        {
            var configFile = Path.Combine(Alt.Server.RootDirectory, "resources", Alt.Server.Resource.Name, "config.json");
            if (!File.Exists(configFile)) throw new FileNotFoundException("Missing config.json");

            try
            {
                Configuration = JsonSerializer.Deserialize<Configuration>(File.ReadAllText(configFile));
                Alt.Log($"[SaltyChat] New status: enabled. Version: {_Version}. Server-ID: {Configuration.ServerIdentifier}");
            }
            catch (Exception ex)
            {
                Alt.Log("[SaltyChat] Failed loading configuration from config.json: " + ex);
                Environment.FailFast("Failed loading configuration from config.json", ex);
            }

            Instance = this;
            Alt.OnPlayerDisconnect += OnServerPlayerDisconnect;
            Alt.OnServer<IPlayer, bool>("SaltyChat:SetPlayerAlive", OnServerSetPlayerAlive);
            Alt.OnServer<IPlayer>("SaltyChat:EnablePlayer", OnServerEnablePlayer);
            Alt.OnServer<string>("SaltyChat:UpdateRadioTowers", OnServerUpdateRadioTowers);
            Alt.OnServer<IPlayer, string, bool>("SaltyChat:JoinRadioChannel", OnServerJoinRadioChannel);
            Alt.OnServer<IPlayer, string>("SaltyChat:LeaveRadioChannel", OnServerLeaveRadioChannel);
            Alt.OnServer<IPlayer>("SaltyChat:LeaveAllRadioChannel", OnServerLeaveAllRadioChannel);
            Alt.OnServer<IPlayer, IPlayer>("SaltyChat:StartCall", OnServerStartCall);
            Alt.OnServer<IPlayer, IPlayer>("SaltyChat:EndCall", OnServerEndCall);
            Alt.OnClient<IPlayer, string>("SaltyChat:CheckVersion", OnClientCheckVersion);
            Alt.OnClient<IPlayer, bool>("SaltyChat:IsUsingMegaphone", OnClientIsUsingMegaphone);
            Alt.OnClient<IPlayer, string, bool>("SaltyChat:PlayerIsSending", OnClientPlayerIsSending);
            Alt.OnClient<IPlayer, float>("SaltyChat:SetRange", OnClientSetRange);
            Alt.OnClient<IPlayer, bool>("SaltyChat:ToggleRadioSpeaker", OnClientToggleRadioSpeaker);
        }

        #endregion

        #region Server Events

        private void OnServerPlayerDisconnect(IPlayer player, string reason)
        {
            lock (player)
            {
                Alt.EmitAllClients("SaltyChat:RemoveClient", player.Id);
                if (!_voiceClients.Remove(player, out var voiceClient)) return;
                foreach (var radioChannel in _radioChannels) radioChannel.RemoveMember(voiceClient);
                foreach (var call in _phoneCalls.Where(c => c.CallerId == player.Id || c.CalledId == player.Id)) EndCall(call);
            }
        }

        #endregion

        #region Client Events

        private void OnClientCheckVersion(IPlayer player, string version)
        {
            if (!_voiceClients.ContainsKey(player)) return;

            if (!IsVersionAccepted(version)) player.Kick($"[Salty Chat] Required plugin version: {Configuration.MinimumPluginVersion}");
        }

        private void OnClientPlayerIsSending(IPlayer player, string radioChannelName, bool isSending)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;

            var radioChannel = GetRadioChannel(radioChannelName, false);
            if (radioChannel == null || !radioChannel.IsMember(voiceClient)) return;
            radioChannel.Send(voiceClient, isSending);
        }

        private void OnClientSetRange(IPlayer player, float range)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;

            if (Array.IndexOf(Configuration.VoiceRanges, range) == -1) return;
            voiceClient.VoiceRange = range;
            Alt.EmitAllClients("SaltyChat:UpdateClientRange", player, range);
        }

        private void OnClientIsUsingMegaphone(IPlayer player, bool state)
        {
            if (!_voiceClients.ContainsKey(player)) return;
            Alt.EmitAllClients("SaltyChat:IsUsingMegaphone", player, Configuration.MegaphoneRange, state, player.Position);
        }

        private void OnClientToggleRadioSpeaker(IPlayer player, bool state)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;

            voiceClient.IsRadioSpeakerEnabled = state;

            foreach (var radioChannelMembership in GetRadioChannelMembership(voiceClient))
            {
                radioChannelMembership.RadioChannel.SetSpeaker(voiceClient, state);
            }
        }

        #endregion

        #region Exports: State

        private void OnServerSetPlayerAlive(IPlayer player, bool isAlive)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
            voiceClient.IsAlive = isAlive;
            Alt.EmitAllClients("SaltyChat:UpdateClientAlive", voiceClient.Player, isAlive);
        }

        private void OnServerEnablePlayer(IPlayer player)
        {
            var voiceClient = new VoiceClient(player, GetTeamSpeakName(player), Configuration.VoiceRanges[1], player.Health > 100);
            if (_voiceClients.ContainsKey(player)) _voiceClients[player] = voiceClient;
            else _voiceClients.TryAdd(player, voiceClient);

            player.Emit("SaltyChat:Initialize", new ClientInitData(voiceClient.TeamSpeakName));

            var voiceClients = new List<VoiceClient>();
            foreach (var (key, value) in _voiceClients.Where(c => c.Key.Id != player.Id))
            {
                voiceClients.Add(new VoiceClient(key, value.TeamSpeakName, value.VoiceRange, value.IsAlive, key.Position));
                key.Emit("SaltyChat:UpdateClient", player, voiceClient.TeamSpeakName, voiceClient.VoiceRange, voiceClient.IsAlive, player.Position);
            }

            player.Emit("SaltyChat:SyncClients", new ClientSyncData(voiceClients));
        }

        #endregion

        #region Exports: Radio

        private void OnServerUpdateRadioTowers(string radioTowersStr)
        {
            Configuration.RadioTowers = JsonSerializer.Deserialize<RadioTower[]>(radioTowersStr);
            var clientRadioTowers = new ClientRadioTowers(Configuration.RadioTowers);
            Alt.EmitAllClients("SaltyChat:UpdateRadioTowers", clientRadioTowers);
        }

        private void OnServerJoinRadioChannel(IPlayer player, string channelName, bool isPrimary)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
            if (channelName == null) return;

            JoinRadioChannel(voiceClient, channelName, isPrimary);
        }

        private void OnServerLeaveRadioChannel(IPlayer player, string channelName)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;
            if (channelName == null) return;

            LeaveRadioChannel(voiceClient, channelName);
        }

        private void OnServerLeaveAllRadioChannel(IPlayer player)
        {
            if (!_voiceClients.TryGetValue(player, out var voiceClient)) return;

            LeaveRadioChannel(voiceClient);
        }

        #endregion

        #region Exports: Phone

        private void OnServerStartCall(IPlayer caller, IPlayer called)
        {
            caller.Emit("SaltyChat:PhoneEstablish", called, called.Position);
            called.Emit("SaltyChat:PhoneEstablish", caller, caller.Position);
            _phoneCalls.Add(new PhoneCall(caller, called));
        }

        private void OnServerEndCall(IPlayer caller, IPlayer called)
        {
            var phoneCall = _phoneCalls.FirstOrDefault(c => c.Caller == caller && c.Called == called);
            if (phoneCall == null) return;
            EndCall(phoneCall);
        }

        private void EndCall(PhoneCall phoneCall)
        {
            if (phoneCall.Caller is {Exists: true}) phoneCall.Caller.Emit("SaltyChat:PhoneEnd", phoneCall.CalledId);
            if (phoneCall.Called is {Exists: true}) phoneCall.Called.Emit("SaltyChat:PhoneEnd", phoneCall.CallerId);
            _phoneCalls.Remove(phoneCall);
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