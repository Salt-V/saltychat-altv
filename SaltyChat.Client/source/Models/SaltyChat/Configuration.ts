import {RadioTower} from "./RadioTower";


export class Configuration {
    public serverIdentifier: string;
    public teamSpeakName: string;
    public soundPack: string;
    public ingameChannel: number;
    public ingameChannelPassword: string;
    public swissChannels: number[];
    public voiceRanges: number[];
    public radioTowers: RadioTower[];
    public requestTalkStates: boolean;
    public requestRadioTrafficStates: boolean;
    public radioRangeUltraShort: number;
    public radioRangeShort: number;
    public radioRangeLong: number;
}