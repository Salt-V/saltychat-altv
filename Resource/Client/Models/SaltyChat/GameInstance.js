export class GameInstance {
    serverUniqueIdentifier;
    name;
    channelId;
    channelPassword;
    soundPack;
    swissChannelIds;
    sendTalkStates;
    sendRadioTrafficStates;
    ultraShortRangeDistance;
    shortRangeDistance;
    longRangeDistance;
    versionInfo = "1.2.1";
    constructor(serverUniqueIdentifier, name, channelId, channelPassword, soundPack, swissChannels, sendTalkStates, sendRadioTrafficStates, rRangeUltraShort, rRangeShort, rRangeLong) {
        this.serverUniqueIdentifier = serverUniqueIdentifier;
        this.name = name;
        this.channelId = channelId;
        this.channelPassword = channelPassword;
        this.soundPack = soundPack;
        this.swissChannelIds = swissChannels;
        this.sendTalkStates = sendTalkStates;
        this.sendRadioTrafficStates = sendRadioTrafficStates;
        this.ultraShortRangeDistance = rRangeUltraShort;
        this.shortRangeDistance = rRangeShort;
        this.longRangeDistance = rRangeLong;
    }
}
