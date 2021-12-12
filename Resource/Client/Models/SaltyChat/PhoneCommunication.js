export class PhoneCommunication {
    name;
    signalStrength = null;
    volume = null;
    direct;
    relayedBy = null;
    constructor(name, direct, signalStrength = null, volume = null, relayedBy = null) {
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
