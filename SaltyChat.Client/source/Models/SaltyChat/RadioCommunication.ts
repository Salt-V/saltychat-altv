import { RadioType } from "../../Enum/SaltyChat/RadioType";

export class RadioCommunication {
    public name: string;
    public senderRadioType: RadioType;
    public ownRadioType: RadioType;
    public playMicClick: boolean;
    public direct: boolean;
    public secondary: boolean;
    public relayedBy: string[] = null;
    public volume: number = null;

    constructor(name: string, senderRadioType: RadioType, ownRadioType: RadioType, playMicClick: boolean, isSecondary: boolean, direct: boolean, relayedBy?: string[], volume?: number) {
        this.name = name;
        this.senderRadioType = senderRadioType;
        this.ownRadioType = ownRadioType;
        this.playMicClick = playMicClick;
        this.secondary = isSecondary;
        this.direct = direct;
        if (relayedBy != null) this.relayedBy = relayedBy;
        if (volume != null) this.volume = volume;
    }
}