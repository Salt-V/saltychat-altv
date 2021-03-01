export class PhoneCommunication {
    constructor(name, direct, signalStrength = null, volume = null, relayedBy = null) {
        this.signalStrength = null;
        this.volume = null;
        this.relayedBy = null;
        this.name = name;
        this.direct = direct;
        if (signalStrength != null)
            this.signalStrength = signalStrength;
        if (volume != null)
            this.volume = volume;
        if (relayedBy != null)
            this.relayedBy = relayedBy;
    }
}
