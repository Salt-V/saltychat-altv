import { DeviceState } from "../../Enum/Internal/DeviceState";
export class SoundState {
    microphoneMuted = false;
    microphoneEnabled = false;
    soundMuted = false;
    soundEnabled = false;
    usingMegaphone = false;
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
