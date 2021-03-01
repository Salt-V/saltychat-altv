import { doesAnimDictExist, hasAnimDictLoaded, requestAnimDict } from "natives";
import { setInterval, clearInterval } from "alt-client";
export function loadAnimDict(animDict) {
    return new Promise((res, rej) => {
        if (!doesAnimDictExist(animDict)) {
            rej("Invalid animation dictionary");
            return;
        }
        if (hasAnimDictLoaded(animDict)) {
            res(true);
            return;
        }
        let tries = 0;
        let interval = setInterval(() => {
            if (tries >= 100) {
                clearInterval(interval);
                rej(`Timeout reached loading dictionary ${animDict}`);
            }
            else {
                if (!hasAnimDictLoaded(animDict)) {
                    requestAnimDict(animDict);
                    tries++;
                }
                else {
                    clearInterval(interval);
                    res(true);
                }
            }
        }, 50);
    });
}
