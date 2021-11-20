import { Player} from "alt-client";
import { getRoomKeyFromEntity, hasEntityClearLosToEntity } from "natives";
import { RoomCombinations } from '../Dumps/RoomCombinations'

/**
 * Compares the roomId of the local player with the roomId of another player and determines the voice compensation factor
 * @param oPlayer Object of the other player
 * @returns {} Returns the muffle index of the player, or null if the player is not in a room
 */
export function roomComparison(oPlayer: Player) {
    let roomIdPlayer = getRoomKeyFromEntity(Player.local.scriptID);
    let roomIdOPlayer = getRoomKeyFromEntity(oPlayer.scriptID);
    let roomExtension = RoomCombinations.some(roomPairs => {
        if (Object.values(roomPairs).indexOf(roomIdPlayer) > -1 &&
            Object.values(roomPairs).indexOf(roomIdOPlayer) > -1) {
            return true
        } else { return false;}
    })
    
    // Both players in the same room
    if (roomIdPlayer == roomIdOPlayer) return null;

    // The room was expanded over the dumps
    if (roomExtension) return null;

    // Clear view of the other player but possibly glass between them
    if (hasEntityClearLosToEntity(Player.local.scriptID, oPlayer.scriptID, 17)) return 1;

    // A player stands outside a building of one inside
    if (roomIdPlayer == 0 && roomIdOPlayer != 0) return 10;
    if (roomIdOPlayer == 0 && roomIdPlayer != 0) return 10;

    // Both players within one building, but different rooms
    if (roomIdPlayer != roomIdOPlayer) return 7;
    return 0;
}