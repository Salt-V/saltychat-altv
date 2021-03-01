import { Vector3 } from "alt-client";

export class Configuration {
    public serverIdentifier:string;
    public teamSpeakName: string;
    public soundPack: string;
    public ingameChannel: number;
    public ingameChannelPassword: string;
    public swissChannels: number[];
    public voiceRanges: number[];
    public radioTowers: Vector3[];
    public requestTalkStates: boolean;
    public requestRadioTrafficStates: boolean;
}