using System.Collections.Generic;
using System.Threading.Tasks.Dataflow;
using AltV.Net;

namespace SaltyChat.Server.Models
{
    public class RadioTowers : IWritable
    {
        private IEnumerable<RadioTower> _radioTowers;

        public RadioTowers(IEnumerable<RadioTower> radioTowers)
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

    public class RadioTower
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }
        public float Range { get; set; } = 8000;
    }
}