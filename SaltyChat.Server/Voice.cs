using AltV.Net;

namespace SaltyChat.Server
{
    public class Voice : Resource
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