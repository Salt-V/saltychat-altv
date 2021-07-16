import * as alt from "alt-client";
import * as native from "natives";
import { Config } from "./config";
import { loadAnimDict } from "./Helpers/LoadAnimDict";
import { hasOpening } from "./Helpers/HasOpening";
import { BulkUpdate } from "./Models/SaltyChat/BulkUpdate";
import { GameInstance } from "./Models/SaltyChat/GameInstance";
import { MegaphoneCommunication } from "./Models/SaltyChat/MegaphoneCommunication";
import { PhoneCommunication } from "./Models/SaltyChat/PhoneCommunication";
import { PlayerState } from "./Models/SaltyChat/PlayerState";
import { PluginCommand } from "./Models/SaltyChat/PluginCommand";
import { RadioCommunication } from "./Models/SaltyChat/RadioCommunication";
import { RadioConfiguration } from "./Models/SaltyChat/RadioConfiguration";
import { RadioTowers } from "./Models/SaltyChat/RadioTower";
import { SelfState } from "./Models/SaltyChat/SelfState";
import { SoundState } from "./Models/SaltyChat/SoundState";
import { Sound } from "./Models/SaltyChat/Sound";
import { VoiceClient } from "./Models/SaltyChat/VoiceClient";
import { Command } from "./Enum/SaltyChat/Command";
import { GameInstanceState } from "./Enum/SaltyChat/GameInstanceState";
import { RadioType } from "./Enum/SaltyChat/RadioType";
import { FromServer } from "./Enum/Events/FromServer";
import { FromClient } from "./Enum/Events/FromClient";
import { ToClient } from "./Enum/Events/ToClient";
import { ToServer } from "./Enum/Events/ToServer";
export class SaltyVoice {
    constructor() {
        this._streamedClients = new Set();
        this._clientIdMap = new Map();
        this._radioConfiguration = new RadioConfiguration;
        this._soundState = new SoundState;
        this._gameInstanceState = GameInstanceState.notInitiated;
        this._isConnected = false;
        this.VoiceClients = new Map();
        if (SaltyVoice._instance != null)
            return;
        alt.on("gameEntityCreate", this.onGameEntityCreate.bind(this));
        alt.on("gameEntityDestroy", this.onGameEntityDestroy.bind(this));
        alt.onceServer(FromServer.initialize, this.onServerInitialize.bind(this));
        alt.onServer(FromServer.syncClients, this.onServerSyncClients.bind(this));
        alt.onServer(FromServer.updateClient, this.onServerUpdateClient.bind(this));
        alt.onServer(FromServer.updateClientAlive, this.onServerUpdateClientAlive.bind(this));
        alt.onServer(FromServer.updateClientRange, this.onServerUpdateClientRange.bind(this));
        alt.onServer(FromServer.removeClient, this.onServerRemoveClient.bind(this));
        alt.onServer(FromServer.phoneEstablish, this.onServerPhoneEstablish.bind(this));
        alt.onServer(FromServer.phoneEnd, this.onServerPhoneEnd.bind(this));
        alt.onServer(FromServer.radioSetChannel, this.onServerRadioSetChannel.bind(this));
        alt.onServer(FromServer.radioLeaveChannel, this.onServerRadioLeaveChannel.bind(this));
        alt.onServer(FromServer.playerIsSending, this.onServerPlayerIsSending.bind(this));
        alt.onServer(FromServer.playerIsSendingRelayed, this.onServerPlayerIsSendingRelayed.bind(this));
        alt.onServer(FromServer.updateRadioTowers, this.onServerUpdateRadioTowers.bind(this));
        alt.onServer(FromServer.isUsingMegaphone, this.onServerIsUsingMegaphone.bind(this));
        alt.on(FromClient.useRadio, this.onClientUseRadio.bind(this));
        alt.on(FromClient.useMegaphone, this.onClientUseMegaphone.bind(this));
        alt.on(FromClient.toggleRange, this.onClientToggleRange.bind(this));
        alt.on(FromClient.setRadioVolume, this.onClientSetRadioVolume.bind(this));
        alt.on(FromClient.toggleRadioSpeaker, this.onClientToggleRadioSpeaker.bind(this));
        alt.on(FromClient.playSound, this.onClientPlaySound.bind(this));
        alt.on(FromClient.stopSound, this.onClientStopSound.bind(this));
        alt.setInterval(this.onTick.bind(this), 250);
        loadAnimDict("random@arrests").catch((rej) => alt.logError(rej));
        loadAnimDict("mp_facial").catch((rej) => alt.logError(rej));
        loadAnimDict("facials@gen_male@variations@normal").catch((rej) => alt.logError(rej));
        this._webView = new alt.WebView("http://resource/Client/Public/webview.html");
        this._webSocket = new alt.WebSocketClient("ws://127.0.0.1:38088/");
        this._webSocket.autoReconnect = true;
        this._webSocket.on("message", this.onMessage.bind(this));
        this._webSocket.on("error", this.onError.bind(this));
        this._webSocket.on("open", this.onConnected.bind(this));
        this._webSocket.on("close", this.onDisconnected.bind(this));
        this._webSocket.start();
    }
    get serverIdentifier() {
        return this._configuration ? this._configuration.serverIdentifier : null;
    }
    ;
    static GetInstance() {
        if (SaltyVoice._instance == null)
            SaltyVoice._instance = new SaltyVoice();
        return SaltyVoice._instance;
    }
    onGameEntityCreate(entity) {
        if (!(entity instanceof alt.Player))
            return;
        this._streamedClients.add(entity);
    }
    onGameEntityDestroy(entity) {
        if (!(entity instanceof alt.Player))
            return;
        this._streamedClients.delete(entity);
    }
    onServerInitialize(configuration) {
        this._configuration = configuration;
        this._voiceRange = configuration.voiceRanges[1];
        this.initialize();
    }
    initialize() {
        if (Config.enableOverlay && this._gameInstanceState <= GameInstanceState.notConnected) {
            this._webView.emit("showOverlay", true, Config.overlayLanguage, Config.overlayAddress);
        }
        if (this._gameInstanceState == GameInstanceState.connected)
            this.initializePlugin();
        else {
            let interval = alt.setInterval(() => {
                if (this._gameInstanceState != GameInstanceState.connected)
                    return;
                alt.clearInterval(interval);
                this.initializePlugin();
            }, 500);
        }
    }
    onServerSyncClients(voiceClients) {
        this.VoiceClients.clear();
        this._clientIdMap.clear();
        voiceClients.forEach((client) => {
            let player = alt.Player.getByID(client.id);
            this.onServerUpdateClient(player, client.teamSpeakName, client.voiceRange, client.isAlive, client.position);
        });
    }
    onServerUpdateClient(player, teamSpeakName, voiceRange, isAlive, position) {
        let voiceClient = new VoiceClient(player, teamSpeakName, voiceRange, isAlive, position);
        this.VoiceClients.set(player.id, voiceClient);
        this._clientIdMap.set(teamSpeakName, player.id);
    }
    onServerUpdateClientAlive(player, isAlive) {
        if (!this.VoiceClients.has(player.id))
            return;
        if (Config.automaticPlayerHealth)
            Config.automaticPlayerHealth = false;
        let voiceClient = this.VoiceClients.get(player.id);
        voiceClient.isAlive = isAlive;
    }
    onServerUpdateClientRange(player, voiceRange) {
        if (!this.VoiceClients.has(player.id))
            return;
        let voiceClient = this.VoiceClients.get(player.id);
        voiceClient.voiceRange = voiceRange;
    }
    onServerRemoveClient(playerId) {
        if (!this.VoiceClients.has(playerId))
            return;
        let voiceClient = this.VoiceClients.get(playerId);
        this.executeCommand(new PluginCommand(Command.removePlayer, new PlayerState(voiceClient.teamSpeakName)));
        this.VoiceClients.delete(playerId);
        this._clientIdMap.delete(voiceClient.teamSpeakName);
    }
    onServerPhoneEstablish(player, position) {
        if (!this.VoiceClients.has(player.id))
            return;
        let voiceClient = this.VoiceClients.get(player.id);
        if (voiceClient.distanceCulled) {
            voiceClient.lastPosition = position;
            voiceClient.SendPlayerStateUpdate();
        }
        let signalDistortion = 10;
        if (Config.enableSignalStrength) {
            signalDistortion = native.getZoneScumminess(native.getZoneAtCoords(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z))
                + native.getZoneScumminess(native.getZoneAtCoords(position.x, position.y, position.z));
        }
        this.executeCommand(new PluginCommand(Command.phoneCommunicationUpdate, new PhoneCommunication(voiceClient.teamSpeakName, true, signalDistortion)));
    }
    onServerPhoneEnd(playerId) {
        if (!this.VoiceClients.has(playerId))
            return;
        let voiceClient = this.VoiceClients.get(playerId);
        this.executeCommand(new PluginCommand(Command.stopPhoneCommunication, new PhoneCommunication(voiceClient.teamSpeakName, true)));
    }
    onServerRadioSetChannel(radioChannel, isPrimary) {
        if (isPrimary)
            this._radioConfiguration.primaryChannel = radioChannel;
        else
            this._radioConfiguration.secondaryChannel = radioChannel;
        alt.emit(ToClient.radioChanged, radioChannel, isPrimary);
        if (Config.enableRadioSound)
            this.playSound("enterRadioChannel", false, "radio");
    }
    onServerRadioLeaveChannel(radioChannel) {
        if (this._radioConfiguration.primaryChannel == radioChannel) {
            this._radioConfiguration.primaryChannel = null;
            alt.emit(ToClient.radioChanged, true, null);
        }
        else if (this._radioConfiguration.secondaryChannel == radioChannel) {
            this._radioConfiguration.secondaryChannel = null;
            alt.emit(ToClient.radioChanged, false, null);
        }
        if (Config.enableRadioSound)
            this.playSound("leaveRadioChannel", false, "radio");
    }
    onServerPlayerIsSending(player, radioChannel, isSending, stateChange, position) {
        this.onServerPlayerIsSendingRelayed(player, radioChannel, isSending, stateChange, position, true, []);
    }
    onServerPlayerIsSendingRelayed(player, radioChannel, isSending, stateChange, position, direct, relays) {
        let teamspeakName;
        if (player == alt.Player.local)
            teamspeakName = this._configuration.teamSpeakName;
        else if (this.VoiceClients.has(player.id)) {
            let voiceClient = this.VoiceClients.get(player.id);
            if (voiceClient.distanceCulled) {
                voiceClient.lastPosition = position;
                voiceClient.SendPlayerStateUpdate();
            }
            teamspeakName = voiceClient.teamSpeakName;
        }
        else
            return;
        if (isSending) {
            this.executeCommand(new PluginCommand(Command.radioCommunicationUpdate, new RadioCommunication(teamspeakName, Config.radioRange, Config.radioRange, stateChange, this._radioConfiguration.secondaryChannel == radioChannel, direct, relays, this._radioConfiguration.volume)));
        }
        else {
            this.executeCommand(new PluginCommand(Command.stopRadioCommunication, new RadioCommunication(teamspeakName, RadioType.none, RadioType.none, stateChange, this._radioConfiguration.secondaryChannel == radioChannel, direct)));
        }
    }
    onServerUpdateRadioTowers(radioTowers) {
        if (!this._configuration)
            return;
        this._configuration.radioTowers = radioTowers;
        if (this._gameInstanceState != GameInstanceState.connected)
            return;
        this.executeCommand(new PluginCommand(Command.radioTowerUpdate, new RadioTowers(radioTowers)));
    }
    onServerIsUsingMegaphone(player, range, isSending, position) {
        if (this._gameInstanceState <= 0 || !this._configuration)
            return;
        let name = null;
        if (player.id == alt.Player.local.id) {
            name = this._configuration.teamSpeakName;
            this._soundState.usingMegaphone = isSending;
        }
        else if (this.VoiceClients.has(player.id)) {
            let voiceClient = this.VoiceClients.get(player.id);
            if (voiceClient.distanceCulled) {
                voiceClient.lastPosition = position;
                voiceClient.SendPlayerStateUpdate();
            }
            name = voiceClient.teamSpeakName;
        }
        else
            return;
        this.executeCommand(new PluginCommand(isSending ? Command.megaphoneCommunicationUpdate : Command.stopMegaphoneCommunication, new MegaphoneCommunication(name, range)));
    }
    onConnected() {
        this._isConnected = true;
        this._gameInstanceState = GameInstanceState.connected;
        alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
        if (this.serverIdentifier)
            this.initializePlugin();
    }
    onDisconnected(code, reason) {
        this._isConnected = false;
        this._gameInstanceState = GameInstanceState.notConnected;
        alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
    }
    onMessage(messageJson) {
        let message = JSON.parse(messageJson);
        if (message.ServerUniqueIdentifier != this.serverIdentifier)
            return;
        switch (message.Command) {
            case Command.pluginState:
                alt.emitServer(ToServer.checkVersion, message.Parameter.Version);
                this.executeCommand(new PluginCommand(Command.radioTowerUpdate, new RadioTowers(this._configuration.radioTowers)));
                break;
            case Command.reset:
                this._gameInstanceState = GameInstanceState.notInitiated;
                alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
                this.initializePlugin();
                break;
            case Command.ping:
                this.executeCommand(new PluginCommand(Command.pong));
                break;
            case Command.instanceState:
                this._gameInstanceState = message.Parameter.State;
                if (Config.enableOverlay) {
                    this._webView.emit("showOverlay", this._gameInstanceState <= GameInstanceState.notConnected, Config.overlayLanguage, Config.overlayAddress);
                }
                alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
                break;
            case Command.soundState:
                if (message.Parameter.IsMicrophoneMuted != this._soundState.microphoneMuted) {
                    this._soundState.microphoneMuted = message.Parameter.IsMicrophoneMuted;
                }
                if (message.Parameter.IsMicrophoneEnabled != this._soundState.microphoneEnabled) {
                    this._soundState.microphoneEnabled = message.Parameter.IsMicrophoneEnabled;
                }
                if (message.Parameter.IsSoundMuted != this._soundState.soundMuted) {
                    this._soundState.soundMuted = message.Parameter.IsSoundMuted;
                }
                if (message.Parameter.IsSoundEnabled != this._soundState.soundEnabled) {
                    this._soundState.soundEnabled = message.Parameter.IsSoundEnabled;
                }
                alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
                break;
            case Command.talkState:
                this.setPlayerTalking(message.Parameter.Name, message.Parameter.IsTalking);
                break;
        }
    }
    onError(error) {
        alt.logError(JSON.stringify(error));
    }
    executeCommand(command) {
        if (!this._isConnected)
            return;
        if (!this.serverIdentifier)
            return;
        command.serverUniqueIdentifier = this.serverIdentifier;
        this._webSocket.send(JSON.stringify(command));
    }
    playSound(fileName, loop = false, handle = null) {
        if (this._gameInstanceState <= 0 || !this._configuration)
            return;
        if (!handle)
            handle = fileName;
        this.executeCommand(new PluginCommand(Command.playSound, new Sound(fileName, loop, handle)));
    }
    stopSound(handle) {
        if (this._gameInstanceState <= 0 || !this._configuration)
            return;
        this.executeCommand(new PluginCommand(Command.stopSound, new Sound(handle)));
    }
    onTick() {
        if (this._gameInstanceState <= 0 || !this._configuration)
            return;
        if (alt.Player.local.health > 100)
            this.controlTick();
        this.stateUpdateTick();
    }
    controlTick() {
        if (!alt.Player.local.vehicle && this._soundState.usingMegaphone) {
            alt.emitServer(ToServer.isUsingMegaphone, false);
        }
    }
    stateUpdateTick() {
        let playerStates = [];
        let localRoomId = native.getRoomKeyFromEntity(alt.Player.local.scriptID);
        let localScriptId = alt.Player.local.scriptID;
        this.VoiceClients.forEach((voiceClient) => {
            let nextPlayer = voiceClient.player;
            if (!nextPlayer.valid)
                return;
            if (!this._streamedClients.has(nextPlayer)) {
                if (!voiceClient.distanceCulled) {
                    voiceClient.distanceCulled = true;
                    playerStates.push(new PlayerState(voiceClient.teamSpeakName, voiceClient.lastPosition, voiceClient.voiceRange, voiceClient.isAlive, voiceClient.distanceCulled, null));
                }
            }
            else {
                if (voiceClient.distanceCulled)
                    voiceClient.distanceCulled = false;
                if (Config.automaticPlayerHealth)
                    voiceClient.isAlive = nextPlayer.health > 0;
                voiceClient.lastPosition = nextPlayer.pos;
                let muffleIntensity = null;
                if (Config.enableMuffling) {
                    let npRoomId = native.getRoomKeyFromEntity(nextPlayer.scriptID);
                    if (localRoomId != npRoomId && !native.hasEntityClearLosToEntity(localScriptId, nextPlayer.scriptID, 17)) {
                        muffleIntensity = 10;
                    }
                    else {
                        let pVehicle = alt.Player.local.vehicle;
                        let nVehicle = nextPlayer.vehicle;
                        if (pVehicle != nVehicle) {
                            if (pVehicle && !hasOpening(pVehicle))
                                muffleIntensity += 4;
                            if (nVehicle && !hasOpening(nVehicle))
                                muffleIntensity += 4;
                        }
                    }
                }
                playerStates.push(new PlayerState(voiceClient.teamSpeakName, voiceClient.lastPosition, voiceClient.voiceRange, voiceClient.isAlive, voiceClient.distanceCulled, muffleIntensity));
            }
        });
        this.executeCommand(new PluginCommand(Command.bulkUpdate, new BulkUpdate(playerStates, new SelfState(alt.Player.local.pos, native.getGameplayCamRot(0).z))));
    }
    setPlayerTalking(teamSpeakName, isTalking) {
        let playerId = null;
        if (this._configuration && teamSpeakName == this._configuration.teamSpeakName)
            playerId = alt.Player.local.scriptID;
        else {
            let voiceClient = this.VoiceClients.get(this._clientIdMap.get(teamSpeakName));
            if (voiceClient != null)
                playerId = voiceClient.player.scriptID;
        }
        if (playerId && Config.enableLipSync) {
            if (isTalking)
                native.playFacialAnim(playerId, "mic_chatter", "mp_facial");
            else
                native.playFacialAnim(playerId, "mood_normal_1", "facials@gen_male@variations@normal");
        }
    }
    initializePlugin() {
        this.executeCommand(new PluginCommand(Command.initiate, new GameInstance(this.serverIdentifier, this._configuration.teamSpeakName, this._configuration.ingameChannel, this._configuration.ingameChannelPassword, this._configuration.soundPack, this._configuration.swissChannels, this._configuration.requestTalkStates, this._configuration.requestRadioTrafficStates, this._configuration.radioRangeUltraShort, this._configuration.radioRangeShort, this._configuration.radioRangeLong)));
    }
    onClientUseRadio(primaryRadio, isSending) {
        if (primaryRadio) {
            if (isSending != this._radioConfiguration.usingPrimaryRadio) {
                alt.emitServer(ToServer.playerIsSending, this._radioConfiguration.primaryChannel, isSending);
                if (isSending && Config.enableRadioAnimation)
                    native.taskPlayAnim(alt.Player.local.scriptID, "random@arrests", "generic_radio_enter", 2, 2, -1, 50, 1, false, false, false);
                else
                    native.clearPedTasks(alt.Player.local.scriptID);
                this._radioConfiguration.usingPrimaryRadio = isSending;
            }
        }
        else {
            if (isSending != this._radioConfiguration.usingSecondaryRadio) {
                alt.emitServer(ToServer.playerIsSending, this._radioConfiguration.secondaryChannel, isSending);
                if (isSending && Config.enableRadioAnimation)
                    native.taskPlayAnim(alt.Player.local.scriptID, "random@arrests", "generic_radio_enter", 2, 2, -1, 50, 1, false, false, false);
                else
                    native.clearPedTasks(alt.Player.local.scriptID);
                this._radioConfiguration.usingSecondaryRadio = isSending;
            }
        }
    }
    onClientUseMegaphone(isSending) {
        this._soundState.usingMegaphone = isSending;
        alt.emitServer(ToServer.isUsingMegaphone, isSending);
    }
    onClientToggleRange() {
        let newIndex;
        let index = this._configuration.voiceRanges.indexOf(this._voiceRange);
        if (index < 0)
            newIndex = 1;
        else if (index + 1 >= this._configuration.voiceRanges.length)
            newIndex = 0;
        else
            newIndex = index + 1;
        this._voiceRange = this._configuration.voiceRanges[newIndex];
        alt.emitServer(ToServer.setRange, this._voiceRange);
        alt.emit(ToClient.voiceRangeChanged, this._voiceRange, newIndex);
    }
    onClientSetRadioVolume(volume) {
        if (volume < 0)
            volume = 0;
        else if (volume > 1.6)
            volume = 1.6;
        this._radioConfiguration.volume = volume;
    }
    onClientToggleRadioSpeaker() {
        this._radioConfiguration.speakerEnabled = !this._radioConfiguration.speakerEnabled;
        alt.emitServer(ToServer.toggleRadioSpeaker, this._radioConfiguration.speakerEnabled);
    }
    onClientPlaySound(fileName, loop = false, handle = null) {
        this.playSound(fileName, loop, handle);
    }
    onClientStopSound(handle) {
        this.stopSound(handle);
    }
}
SaltyVoice._instance = null;
SaltyVoice.GetInstance();
