using AltV.Net.Elements.Entities;

namespace SaltyChat.Server.Models
{
    public class PhoneCall
    {
        public readonly IPlayer Caller;
        public readonly ulong CallerId;
        public readonly IPlayer Called;
        public readonly ulong CalledId;

        public PhoneCall(IPlayer caller, IPlayer called)
        {
            Caller = caller;
            CallerId = caller.Id;
            Called = called;
            CalledId = called.Id;
        }
    }
}