using AltV.Net;
using AltV.Net.Async;

namespace SaltyChat.Server
{
    public class Voice : AsyncResource
    {
        public override void OnStart()
        {
            var voiceManager = new VoiceManager();
            Alt.Log("Salty Voice enabled.");
        }

        public override void OnStop()
        {
            Alt.Log("Salty Voice disabled.");
        }
    }
}