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
            return DeviceState.Disabled;
        else if (this.microphoneMuted)
            return DeviceState.Muted;
        else
            return DeviceState.Enabled;
    }
    get speaker() {
        if (!this.soundEnabled)
            return DeviceState.Disabled;
        else if (this.soundMuted)
            return DeviceState.Muted;
        else
            return DeviceState.Enabled;
    }
}
