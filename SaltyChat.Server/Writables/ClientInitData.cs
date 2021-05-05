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
            new ClientRadioTowers(VoiceManager.Configuration.RadioTowers).OnWrite(writer);

            writer.Name("requestTalkStates");
            writer.Value(VoiceManager.Configuration.RequestTalkStates);
            writer.Name("requestRadioTrafficStates");
            writer.Value(VoiceManager.Configuration.RequestRadioTrafficStates);
            writer.Name("radioRangeUltraShort");
            writer.Value(VoiceManager.Configuration.RadioRangeUltraShort);
            writer.Name("radioRangeShort");
            writer.Value(VoiceManager.Configuration.RadioRangeShort);
            writer.Name("radioRangeLong");
            writer.Value(VoiceManager.Configuration.RadioRangeLong);
            writer.EndObject();
        }
    }
}