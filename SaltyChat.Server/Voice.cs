using AltV.Net;
using AltV.Net.Async;

namespace SaltyChat.Server
{
    public class Voice : AsyncResource
    {
        public override void OnStart()
        {
            var voiceManager = new VoiceManager();
        }

        public override void OnStop()
        {
            Alt.Log("[SaltyChat] New status: disabled");
        }
    }
}