import { MuffleEffect } from "./MuffleEffect";
export class PlayerState {
    constructor(name, position, voiceRange, isAlive, distanceCulled = false, muffleIntensity = null, volumeOverride = null) {
        this.volumeOverride = null;
        this.name = name;
        if (position)
            this.position = position;
        if (voiceRange)
            this.voiceRange = voiceRange;
        if (isAlive != null)
            this.isAlive = isAlive;
        this.distanceCulled = distanceCulled;
        if (muffleIntensity != null)
            this.muffle = new MuffleEffect(muffleIntensity);
        if (volumeOverride != null) {
            if (volumeOverride > 1.6)
                this.volumeOverride = 1.6;
            else if (volumeOverride < 0)
                this.volumeOverride = 0;
            else
                this.volumeOverride = volumeOverride;
        }
    }
}
