using AltV.Net;

namespace SaltyChat.Server.Writables
{
    public class ClientInitData : IWritable
    {
        private string _teamSpeakName { get; set; }

        public ClientInitData(string teamSpeakName)
        {
            _teamSpeakName = teamSpeakName;
        }

        public void OnWrite(IMValueWriter writer)
        {
            writer.BeginObject();
            writer.Name("serverIdentifier");
            writer.Value(VoiceManager.Configuration.ServerIdentifier);
            writer.Name("teamSpeakName");
            writer.Value(_teamSpeakName);
            writer.Name("soundPack");
            writer.Value(VoiceManager.Configuration.SoundPack);
            writer.Name("ingameChannel");
            writer.Value(VoiceManager.Configuration.IngameChannel);
            writer.Name("ingameChannelPassword");
            writer.Value(VoiceManager.Configuration.IngameChannelPassword);
            writer.Name("swissChannels");

            writer.BeginArray();
            foreach (var channel in VoiceManager.Configuration.SwissChannels) writer.Value(channel);
            writer.EndArray();

            writer.Name("voiceRanges");
            writer.BeginArray();
            foreach (var voiceRange in VoiceManager.Configuration.VoiceRanges) writer.Value(voiceRange);
            writer.EndArray();

            writer.Name("radioTowers");
            writer.BeginArray();
            foreach (var radioTower in VoiceManager.Configuration.RadioTowers)
            {
                writer.BeginObject();
                writer.Name("x");
                writer.Value(radioTower.X);
                writer.Name("y");
                writer.Value(radioTower.Y);
                writer.Name("z");
                writer.Value(radioTower.Z);
                writer.EndObject();
            }

            writer.EndArray();

            writer.Name("requestTalkStates");
            writer.Value(VoiceManager.Configuration.RequestTalkStates);
            writer.Name("requestRadioTrafficStates");
            writer.Value(VoiceManager.Configuration.RequestRadioTrafficStates);
            writer.EndObject();
        }
    }
}