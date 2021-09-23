import { PluginCommand } from "./PluginCommand";
import { Command } from "../../Enum/SaltyChat/Command";
import { PlayerState } from "./PlayerState";
import { SaltyVoice } from "../../app";
export class VoiceClient {
    player;
    teamSpeakName;
    voiceRange;
    isAlive;
    lastPosition;
    distanceCulled;
    constructor(player, teamSpeakName, voiceRange, isAlive, lastPosition) {
        this.player = player;
        this.teamSpeakName = teamSpeakName;
        this.voiceRange = voiceRange;
        this.isAlive = isAlive;
        this.lastPosition = lastPosition;
    }
    SendPlayerStateUpdate() {
        SaltyVoice.GetInstance().executeCommand(new PluginCommand(Command.playerStateUpdate, new PlayerState(this.teamSpeakName, this.lastPosition, this.voiceRange, this.isAlive)));
    }
}
