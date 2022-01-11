using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SaltyChat.Server.Shared
{
    public class Event
    {
        #region Plugin
        public const string SaltyChat_Initialize = "SaltyChat_Initialize";
        public const string SaltyChat_CheckVersion = "SaltyChat_CheckVersion";
        public const string SaltyChat_UpdateVoiceRange = "SaltyChat_UpdateVoiceRange";
        public const string SaltyChat_RemoveClient = "SaltyChat_RemoveClient";
        #endregion
        #region State Change
        public const string SaltyChat_PluginStateChanged = "SaltyChat_PluginStateChanged";
        public const string SaltyChat_TalkStateChanged = "SaltyChat_TalkStateChanged";
        public const string SaltyChat_VoiceRangeChanged = "SaltyChat_VoiceRangeChanged";
        public const string SaltyChat_MicStateChanged = "SaltyChat_MicStateChanged";
        public const string SaltyChat_MicEnabledChanged = "SaltyChat_MicEnabledChanged";
        public const string SaltyChat_SoundStateChanged = "SaltyChat_SoundStateChanged";
        public const string SaltyChat_SoundEnabledChanged = "SaltyChat_SoundEnabledChanged";
        public const string SaltyChat_RadioTrafficStateChanged = "SaltyChat_RadioTrafficStateChanged";
        #endregion
        #region Phone
        public const string SaltyChat_PhoneEstablish = "SaltyChat:PhoneEstablish"; // aka. EstablishCall
        public const string SaltyChat_PhoneEstablishRelayed = "SaltyChat:PhoneEstablishRelayed";
        public const string SaltyChat_EndCall = "SaltyChat_EndCall";
        #endregion

        #region Radio
        public const string SaltyChat_RadioChannelMemberUpdated = "SaltyChat:RadioChannelMemberUpdated"; // REMOVED IN THE FUTURE
        public const string SaltyChat_SetRadioSpeaker = "SaltyChat_SetRadioSpeaker";
        public const string SaltyChat_ChannelInUse = "SaltyChat_ChannelInUse";
        public const string SaltyChat_IsSending = "SaltyChat:PlayerIsSending";
        public const string SaltyChat_IsSendingRelayed = "SaltyChat:PlayerIsSendingRelayed"; // REMOVED IN THE FUTURE!!
        public const string SaltyChat_SetRadioChannel = "SaltyChat_SetRadioChannel";
        public const string SaltyChat_UpdateRadioTowers = "SaltyChat_UpdateRadioTowers";
        #endregion
    }
}
