export class GameInstance {
    constructor(serverUniqueIdentifier, name, channelId, channelPassword, soundPack, swissChannels, sendTalkStates, sendRadioTrafficStates, rRangeUltraShort, rRangeShort, rRangeLong) {
        this.versionInfo = "1.0.8";
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
