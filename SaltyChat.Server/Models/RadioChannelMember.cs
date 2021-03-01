namespace SaltyChat.Server.Models
{
    public class RadioChannelMember
    {
        #region Props / Fields

        internal RadioChannel RadioChannel { get; }
        internal VoiceClient VoiceClient { get; }
        internal bool IsPrimary { get; }
        internal bool IsSending { get; set; }
        internal bool IsSpeakerEnabled { get; set; }

        #endregion

        #region Constructor

        internal RadioChannelMember(RadioChannel radioChannel, VoiceClient voiceClient, bool isPrimary)
        {
            RadioChannel = radioChannel;
            VoiceClient = voiceClient;
            IsPrimary = isPrimary;
        }

        #endregion
    }
}