import {DeviceState} from "../../Enum/Internal/DeviceState";

export class SoundState {
    public microphoneMuted: boolean = false;
    public microphoneEnabled: boolean = false;
    public soundMuted: boolean = false;
    public soundEnabled: boolean = false
    public usingMegaphone: boolean = false;

    public get microphone(): DeviceState {
        if (!this.microphoneEnabled) return DeviceState.Disabled;
        else if (this.microphoneMuted) return DeviceState.Muted;
        else return DeviceState.Enabled;
    }

    public get speaker(): DeviceState {
        if (!this.soundEnabled) return DeviceState.Disabled;
        else if (this.soundMuted) return DeviceState.Muted;
        else return DeviceState.Enabled;
    }
}