namespace SaltyChat.Server.Models
{
    public class Configuration
    {
        public string ServerIdentifier { get; set; }
        public string SoundPack { get; set; }
        public uint IngameChannel { get; set; }
        public string IngameChannelPassword { get; set; }
        public uint[] SwissChannels { get; set; }
        public float[] VoiceRanges { get; set; }
        public RadioTower[] RadioTowers { get; set; }
        public bool RequestTalkStates { get; set; }
        public bool RequestRadioTrafficStates { get; set; }
        public string MinimumPluginVersion { get; set; }
        public float MegaphoneRange { get; set; }
        public string NamePattern { get; set; }
        public float RadioRangeUltraShort { get; set; }
        public float RadioRangeShort { get; set; }
        public float RadioRangeLong { get; set; }
    }
}