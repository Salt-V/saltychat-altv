import { PlayerState } from "./PlayerState";
import { SelfState } from "./SelfState";

export class BulkUpdate {
    public playerStates: PlayerState[];
    public selfState: SelfState;

    constructor(playerStates: PlayerState[], selfState: SelfState) {
        this.playerStates = playerStates;
        this.selfState = selfState;
    }
}