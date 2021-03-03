using System.Numerics;

namespace SaltyChat.Server.Models
{
    public class VoiceConfiguration
    {
        public string ServerIdentifier { get; set; }
        public string SoundPack { get; set; }
        public uint IngameChannel { get; set; }
        public string IngameChannelPassword { get; set; }
        public uint[] SwissChannels { get; set; }
        public float[] VoiceRanges { get; set; }
        public Vector3[] RadioTowers { get; set; }
        public bool RequestTalkStates { get; set; }
        public bool RequestRadioTrafficStates { get; set; }
        public string MinimumPluginVersion { get; set; }
        public float MegaphoneRange { get; set; }
        public string NamePattern { get; set; }

        public void MapToConfiguration()
        {
            Configuration.ServerIdentifier = ServerIdentifier;
            Configuration.SoundPack = SoundPack;
            Configuration.IngameChannel = IngameChannel;
            Configuration.IngameChannelPassword = IngameChannelPassword;
            Configuration.SwissChannels = SwissChannels;
            Configuration.VoiceRanges = VoiceRanges;
            Configuration.RadioTowers = RadioTowers;
            Configuration.RequestTalkStates = RequestTalkStates;
            Configuration.RequestRadioTrafficStates = RequestRadioTrafficStates;
            Configuration.MinimumPluginVersion = MinimumPluginVersion;
            Configuration.MegaphoneRange = MegaphoneRange;
            Configuration.NamePattern = NamePattern;
        }
    }
}