import { DeviceState } from "../../Enum/Internal/DeviceState";
export class SoundState {
    constructor() {
        this.microphoneMuted = false;
        this.microphoneEnabled = false;
        this.soundMuted = false;
        this.soundEnabled = false;
        this.usingMegaphone = false;
    }
    get microphone() {
        if (!this.microphoneEnabled)
            return DeviceState.disabled;
        else if (this.microphoneMuted)
            return DeviceState.muted;
        else
            return DeviceState.enabled;
    }
    get speaker() {
        if (!this.soundEnabled)
            return DeviceState.disabled;
        else if (this.soundMuted)
            return DeviceState.muted;
        else
            return DeviceState.enabled;
    }
}
