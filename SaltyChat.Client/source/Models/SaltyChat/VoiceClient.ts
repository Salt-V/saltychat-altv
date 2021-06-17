import { Player, Vector3 } from "alt-client";
import { PluginCommand } from "./PluginCommand";
import { Command } from "../../Enum/SaltyChat/Command";
import { PlayerState } from "./PlayerState";
import {SaltyVoice} from "../../app";

export class VoiceClient {
    public player: Player;
    public teamSpeakName: string;
    public voiceRange: number;
    public isAlive: boolean;
    public lastPosition: Vector3;
    public distanceCulled: boolean;

    constructor(player: Player, teamSpeakName: string, voiceRange: number, isAlive: boolean, lastPosition: Vector3) {
        this.player = player;
        this.teamSpeakName = teamSpeakName;
        this.voiceRange = voiceRange;
        this.isAlive = isAlive;
        this.lastPosition = lastPosition;
    }

    public SendPlayerStateUpdate(): void {
        SaltyVoice.GetInstance().executeCommand(
            new PluginCommand(
                Command.playerStateUpdate,
                new PlayerState(
                    this.teamSpeakName,
                    this.lastPosition,
                    this.voiceRange,
                    this.isAlive
                )
            )
        );
    }
}