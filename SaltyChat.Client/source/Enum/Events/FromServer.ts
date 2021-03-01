export enum FromServer {
    initialize = "SaltyChat:Initialize",
    syncClients = "SaltyChat:SyncClients",
    updateClient = "SaltyChat:UpdateClient",
    updateClientAlive = "SaltyChat:UpdateClientAlive",
    updateClientRange = "SaltyChat:UpdateClientRange",
    removeClient = "SaltyChat:RemoveClient",
    phoneEstablish = "SaltyChat:PhoneEstablish",
    phoneEnd = "SaltyChat:PhoneEnd",
    radioSetChannel = "SaltyChat:RadioSetChannel",
    radioLeaveChannel = "SaltyChat:RadioLeaveChannel",
    playerIsSending = "SaltyChat:PlayerIsSending",
    playerIsSendingRelayed = "SaltyChat:PlayerIsSendingRelayed",
    updateRadioTowers = "SaltyChat:UpdateRadioTowers", // ToDo
    isUsingMegaphone = "SaltyChat:IsUsingMegaphone"
}