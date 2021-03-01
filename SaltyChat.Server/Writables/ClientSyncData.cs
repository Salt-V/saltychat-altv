using System.Collections.Generic;
using AltV.Net;
using SaltyChat.Server.Models;

namespace SaltyChat.Server.Writables
{
    public class ClientSyncData:IWritable
    {
        private IEnumerable<VoiceClient> _voiceClients { get; set; }

        public ClientSyncData(IEnumerable<VoiceClient> voiceClients)
        {
            _voiceClients = voiceClients;
        }

        public void OnWrite(IMValueWriter writer)
        {
            writer.BeginArray();
            foreach (var voiceClient in _voiceClients)
            {
                writer.BeginObject();
                writer.Name("id");
                writer.Value(voiceClient.Player.Id);
                writer.Name("teamSpeakName");
                writer.Value(voiceClient.TeamSpeakName);
                writer.Name("voiceRange");
                writer.Value(voiceClient.VoiceRange);
                writer.Name("isAlive");
                writer.Value(voiceClient.IsAlive);
                writer.Name("position");
                writer.BeginObject();
                writer.Name("x");
                writer.Value(voiceClient.Player.Position.X);
                writer.Name("y");
                writer.Value(voiceClient.Player.Position.Y);
                writer.Name("z");
                writer.Value(voiceClient.Player.Position.Z);
                writer.EndObject();
                writer.EndObject();
            }

            writer.EndArray();
        }
    }
}