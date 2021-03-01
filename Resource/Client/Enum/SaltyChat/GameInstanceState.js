export var GameInstanceState;
(function (GameInstanceState) {
    GameInstanceState[GameInstanceState["notInitiated"] = -1] = "notInitiated";
    GameInstanceState[GameInstanceState["notConnected"] = 0] = "notConnected";
    GameInstanceState[GameInstanceState["connected"] = 1] = "connected";
    GameInstanceState[GameInstanceState["ingame"] = 2] = "ingame";
    GameInstanceState[GameInstanceState["inSwissChannel"] = 3] = "inSwissChannel";
})(GameInstanceState || (GameInstanceState = {}));
