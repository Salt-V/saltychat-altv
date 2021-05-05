using System.Collections.Generic;
using AltV.Net;
using SaltyChat.Server.Models;

namespace SaltyChat.Server.Writables
{
    public class ClientRadioTowers : IWritable
    {
        private readonly IEnumerable<RadioTower> _radioTowers;

        public ClientRadioTowers(IEnumerable<RadioTower> radioTowers)
        {
            _radioTowers = radioTowers;
        }

        public void OnWrite(IMValueWriter writer)
        {
            writer.BeginArray();
            foreach (var radioTower in _radioTowers)
            {
                writer.BeginObject();
                writer.Name("x");
                writer.Value(radioTower.X);
                writer.Name("y");
                writer.Value(radioTower.Y);
                writer.Name("z");
                writer.Value(radioTower.Z);
                writer.Name("range");
                writer.Value(radioTower.Range);
                writer.EndObject();
            }

            writer.EndArray();
        }
    }
}