export class RadioCommunication {
    constructor(name, senderRadioType, ownRadioType, playMicClick, isSecondary, direct, relayedBy, volume) {
        this.relayedBy = null;
        this.volume = null;
        this.name = name;
        this.senderRadioType = senderRadioType;
        this.ownRadioType = ownRadioType;
        this.playMicClick = playMicClick;
        this.secondary = isSecondary;
        this.direct = direct;
        if (relayedBy != null)
            this.relayedBy = relayedBy;
        if (volume != null)
            this.volume = volume;
    }
}
