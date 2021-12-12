import { RadioType } from "./Enum/SaltyChat/RadioType";
export class Config {
    static radioRange = RadioType.longRange;
    static enableRadioAnimation = true;
    static enableLipSync = true;
    static enableMuffling = true;
    static enableSignalStrength = true;
    static enableRadioSound = true;
    static enableOverlay = true;
    static overlayLanguage = "en";
    static overlayAddress = "ts.yourserver.com";
    static automaticPlayerHealth = true;
}
