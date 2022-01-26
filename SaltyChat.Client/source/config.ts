import {RadioType} from "./Enum/SaltyChat/RadioType";

export class Config {
    public static radioRange: RadioType = RadioType.longRange;
    public static enableRadioAnimation: boolean = true;
    public static enableLipSync: boolean = true;
    public static enableMuffling: boolean = true;
    public static enableSignalStrength: boolean = true;
    public static enableRadioSound: boolean = true;
    public static enableOverlay: boolean = true;
    public static overlayLanguage: string = "en";
    public static overlayAddress: string = "ts.yourserver.com";
    public static automaticPlayerHealth: boolean = true;
    public static enableTalkingChangedEvent: boolean = false;
}