export var FromServer;
(function (FromServer) {
    FromServer["initialize"] = "SaltyChat:Initialize";
    FromServer["syncClients"] = "SaltyChat:SyncClients";
    FromServer["updateClient"] = "SaltyChat:UpdateClient";
    FromServer["updateClientAlive"] = "SaltyChat:UpdateClientAlive";
    FromServer["updateClientRange"] = "SaltyChat:UpdateClientRange";
    FromServer["removeClient"] = "SaltyChat:RemoveClient";
    FromServer["phoneEstablish"] = "SaltyChat:PhoneEstablish";
    FromServer["phoneEnd"] = "SaltyChat:PhoneEnd";
    FromServer["radioSetChannel"] = "SaltyChat:RadioSetChannel";
    FromServer["radioLeaveChannel"] = "SaltyChat:RadioLeaveChannel";
    FromServer["playerIsSending"] = "SaltyChat:PlayerIsSending";
    FromServer["playerIsSendingRelayed"] = "SaltyChat:PlayerIsSendingRelayed";
    FromServer["updateRadioTowers"] = "SaltyChat:UpdateRadioTowers";
    FromServer["isUsingMegaphone"] = "SaltyChat:IsUsingMegaphone";
})(FromServer || (FromServer = {}));
