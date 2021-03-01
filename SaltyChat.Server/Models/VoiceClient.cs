using System.Numerics;
using AltV.Net.Elements.Entities;

namespace SaltyChat.Server.Models
{
    public class VoiceClient
    {
        #region Props/Fields

        internal IPlayer Player { get; set; }
        internal string TeamSpeakName { get; set; }
        internal float VoiceRange { get; set; }
        internal bool IsAlive { get; set; }
        internal bool IsRadioSpeakerEnabled { get; set; }
        internal Vector3? Position { get; set; }

        #endregion

        #region Constructor

        internal VoiceClient(IPlayer player, string teamSpeakName, float voiceRange, bool isAlive, Vector3? position = null)
        {
            Player = player;
            TeamSpeakName = teamSpeakName;
            VoiceRange = voiceRange;
            IsAlive = isAlive;
            if (position != null) Position = position;
        }

        #endregion
    }
}