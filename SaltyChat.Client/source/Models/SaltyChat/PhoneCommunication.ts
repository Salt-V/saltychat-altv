export class PhoneCommunication {
    public name: string;
    public signalStrength: number = null;
    public volume: number = null;
    public direct: boolean;
    public relayedBy: string[] = null;

    constructor(name: string, direct: boolean, signalStrength: number = null, volume: number = null, relayedBy: string[] = null) {
        this.name = name;
        this.direct = direct;
        if (signalStrength != null) this.signalStrength = signalStrength;
        if (volume != null) this.volume = volume;
        if (relayedBy != null) this.relayedBy = relayedBy;
    }
}