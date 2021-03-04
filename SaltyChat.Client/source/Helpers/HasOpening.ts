import * as alt from "alt-client";
import * as native from "natives";

export function hasOpening(vehicle: alt.Vehicle): boolean {
    if (native.isThisModelABike(vehicle.model)) return true;
    if (native.isThisModelABoat(vehicle.model)) return true;
    if (native.isThisModelABicycle(vehicle.model)) return true;
    if (native.isThisModelAQuadbike(vehicle.model)) return true;
    if (!native.areAllVehicleWindowsIntact(vehicle.scriptID)) return true;
    if (native.isVehicleAConvertible(vehicle.scriptID, false) && native.getConvertibleRoofState(vehicle.scriptID) != 0) return true;
    if (!native.doesVehicleHaveRoof(vehicle.scriptID)) return true;
    return false;
}