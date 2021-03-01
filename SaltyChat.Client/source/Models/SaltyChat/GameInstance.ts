export class GameInstance {
    public serverUniqueIdentifier: string;
    public name: string;
    public channelId: number;
    public channelPassword: string;
    public soundPack: string;
    public swissChannelIds: number[];
    public sendTalkStates: boolean;
    public sendRadioTrafficStates: boolean;

    constructor(serverUniqueIdentifier: string, name: string, channelId: number, channelPassword: string, soundPack: string, swissChannels: number[], sendTalkStates: boolean, sendRadioTrafficStates: boolean) {
        this.serverUniqueIdentifier = serverUniqueIdentifier;
        this.name = name;
        this.channelId = channelId;
        this.channelPassword = channelPassword;
        this.soundPack = soundPack;
        this.swissChannelIds = swissChannels;
        this.sendTalkStates = sendTalkStates;
        this.sendRadioTrafficStates = sendRadioTrafficStates;
    }
}