import * as alt from "alt-client";
import * as native from "natives";

export function hasOpening(vehicle: alt.Vehicle): boolean {
    if (!native.areAllVehicleWindowsIntact(vehicle.scriptID)) return true;
    for (let i = 0; i < 4; i++) {
        if (!native.isVehicleWindowIntact(vehicle.scriptID, i)) return true;
    }
    if (native.isVehicleAConvertible(vehicle.scriptID, false) && native.getConvertibleRoofState(vehicle.scriptID) != 0) return true;
    return false;
}