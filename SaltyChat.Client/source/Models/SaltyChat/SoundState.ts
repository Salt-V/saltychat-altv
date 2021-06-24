import {DeviceState} from "../../Enum/Internal/DeviceState";

export class SoundState {
    public microphoneMuted: boolean = false;
    public microphoneEnabled: boolean = false;
    public soundMuted: boolean = false;
    public soundEnabled: boolean = false
    public usingMegaphone: boolean = false;

    public get microphone(): DeviceState {
        if (!this.microphoneEnabled) return DeviceState.disabled;
        else if (this.microphoneMuted) return DeviceState.muted;
        else return DeviceState.enabled;
    }

    public get speaker(): DeviceState {
        if (!this.soundEnabled) return DeviceState.disabled;
        else if (this.soundMuted) return DeviceState.muted;
        else return DeviceState.enabled;
    }
}