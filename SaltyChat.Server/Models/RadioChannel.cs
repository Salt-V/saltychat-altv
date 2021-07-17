using System;
using System.Collections.Generic;
using System.Linq;

namespace SaltyChat.Server.Models
{
    public class RadioChannel
    {
        #region Props/Fields

        internal string Name { get; }
        internal RadioChannelMember[] Members => _members.ToArray();
        private readonly List<RadioChannelMember> _members = new();

        #endregion

        #region Constructor

        internal RadioChannel(string name, params RadioChannelMember[] members)
        {
            Name = name;
            if (members != null) _members.AddRange(members);
        }

        #endregion

        #region Methods

        internal bool IsMember(VoiceClient voiceClient) => _members.Any(m => m.VoiceClient == voiceClient);

        internal void AddMember(VoiceClient voiceClient, bool isPrimary)
        {
            if (IsMember(voiceClient)) return;
            _members.Add(new RadioChannelMember(this, voiceClient, isPrimary));
            voiceClient.Player.Emit("SaltyChat:RadioSetChannel", Name, isPrimary);
            foreach (var member in _members.Where(m => m.IsSending))
            {
                voiceClient.Player.Emit("SaltyChat:PlayerIsSending", member.VoiceClient.Player, Name, true, false, member.VoiceClient.Player.Position);
            }
        }

        internal void RemoveMember(VoiceClient voiceClient)
        {
            var member = _members.FirstOrDefault(m => m.VoiceClient == voiceClient);
            if (member == null) return;
            if (member.IsSending)
            {
                if (member.VoiceClient.IsRadioSpeakerEnabled)
                {
                    foreach (var client in VoiceManager.Instance.VoiceClients)
                    {
                        client.Player.Emit("SaltyChat:PlayerIsSendingRelayed", voiceClient.Player, Name, false, true, voiceClient.Player.Position, false, Array.Empty<string>());
                    }
                }
                else
                {
                    foreach (var client in VoiceManager.Instance.VoiceClients)
                    {
                        client.Player.Emit("SaltyChat:PlayerIsSending", voiceClient.Player, Name, false, true, voiceClient.Player.Position);
                    }
                }
            }

            _members.Remove(member);

            foreach (var channelMember in _members.Where(m => m.IsSending))
            {
                voiceClient.Player.Emit("SaltyChat:PlayerIsSending", channelMember.VoiceClient.Player, Name, false, false, channelMember.VoiceClient.Player.Position);
            }

            voiceClient.Player.Emit("SaltyChat:RadioLeaveChannel", null, member.IsPrimary);
        }

        internal void SetSpeaker(VoiceClient voiceClient, bool isEnabled)
        {
            var radioChannelMember = _members.FirstOrDefault(m => m.VoiceClient == voiceClient);
            if (radioChannelMember == null || radioChannelMember.IsSpeakerEnabled == isEnabled) return;

            radioChannelMember.IsSpeakerEnabled = isEnabled;
            var sendingMembers = _members.Where(m => m.IsSending).ToArray();

            if (!sendingMembers.Any()) return;
            if (isEnabled || _members.Any(m => m.IsSpeakerEnabled))
            {
                foreach (var sendingMember in sendingMembers)
                {
                    Send(sendingMember.VoiceClient, true);
                }
            }
            else
            {
                foreach (var sendingMember in sendingMembers)
                {
                    foreach (var client in VoiceManager.Instance.VoiceClients.Where(v => _members.All(m => m.VoiceClient != v)))
                    {
                        client.Player.Emit("SaltyChat:PlayerIsSendingRelayed", sendingMember.VoiceClient.Player, Name, false, false, sendingMember.VoiceClient.Player.Position, false, new string[0]);
                    }
                }
            }
        }

        internal void Send(VoiceClient voiceClient, bool isSending)
        {
            var radioChannelMember = _members.FirstOrDefault(m => m.VoiceClient == voiceClient);
            if (radioChannelMember == null) return;

            var stateChanged = radioChannelMember.IsSending != isSending;
            radioChannelMember.IsSending = isSending;

            var channelMembers = Members;
            var onSpeaker = channelMembers.Where(m => m.VoiceClient.IsRadioSpeakerEnabled && m.VoiceClient != voiceClient).ToArray();

            if (onSpeaker.Length > 0)
            {
                var channelMemberNames = onSpeaker.Select(m => m.VoiceClient.TeamSpeakName).ToArray();
                foreach (var remoteClient in VoiceManager.Instance.VoiceClients)
                {
                    remoteClient.Player.Emit("SaltyChat:PlayerIsSendingRelayed", voiceClient.Player, Name, isSending, stateChanged, voiceClient.Player.Position, IsMember(remoteClient), channelMemberNames);
                }
            }
            else
            {
                foreach (var member in channelMembers)
                {
                    member.VoiceClient.Player.Emit("SaltyChat:PlayerIsSending", voiceClient.Player, Name, isSending, stateChanged, voiceClient.Player.Position);
                }
            }
        }

        #endregion
    }
}