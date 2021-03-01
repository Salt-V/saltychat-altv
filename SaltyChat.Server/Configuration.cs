using System.Numerics;

namespace SaltyChat.Server
{
    public static class Configuration
    {
        public static string ServerIdentifier { get; set; } = "CHANGEME";
        public static string SoundPack { get; set; } = "default";
        public static uint IngameChannel { get; set; } = 100;
        public static string IngameChannelPassword { get; set; } = "CHANGEME";
        public static uint[] SwissChannels { get; set; } = { };
        public static float[] VoiceRanges { get; set; } = {1f, 2f, 3f, 4f, 5f};
        public static Vector3[] RadioTowers { get; set; } = { };
        public static bool RequestTalkStates { get; set; } = true;
        public static bool RequestRadioTrafficStates { get; set; } = false;
        public static string MinimumPluginVersion { get; set; } = "2.2.2";
        public static float MegaphoneRange { get; set; } = 200f;
        public static string NamePattern { get; set; } = "{guid}";
    }
}