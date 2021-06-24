export class GameInstance {
    public serverUniqueIdentifier: string;
    public name: string;
    public channelId: number;
    public channelPassword: string;
    public soundPack: string;
    public swissChannelIds: number[];
    public sendTalkStates: boolean;
    public sendRadioTrafficStates: boolean;
    public ultraShortRangeDistance: number;
    public shortRangeDistance: number;
    public longRangeDistance: number;
    public readonly versionInfo: string = "1.0.9"; // ToDo: Change on update

    constructor(serverUniqueIdentifier: string, name: string, channelId: number, channelPassword: string,
                soundPack: string, swissChannels: number[], sendTalkStates: boolean, sendRadioTrafficStates: boolean,
                rRangeUltraShort: number, rRangeShort: number, rRangeLong: number) {
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