// AltV
import * as alt from "alt-client";
import * as native from "natives";
// Config
import {Config} from "./config";
// Helpers
import {loadAnimDict} from "./Helpers/LoadAnimDict";
import {hasOpening} from "./Helpers/HasOpening";
// Models
import {BulkUpdate} from "./Models/SaltyChat/BulkUpdate";
import {Configuration} from "./Models/SaltyChat/Configuration";
import {GameInstance} from "./Models/SaltyChat/GameInstance";
import {MegaphoneCommunication} from "./Models/SaltyChat/MegaphoneCommunication";
import {PhoneCommunication} from "./Models/SaltyChat/PhoneCommunication";
import {PlayerState} from "./Models/SaltyChat/PlayerState";
import {PluginCommand} from "./Models/SaltyChat/PluginCommand";
import {RadioCommunication} from "./Models/SaltyChat/RadioCommunication";
import {RadioConfiguration} from "./Models/SaltyChat/RadioConfiguration";
import {RadioTower} from "./Models/SaltyChat/RadioTower";
import {SelfState} from "./Models/SaltyChat/SelfState";
import {SoundState} from "./Models/SaltyChat/SoundState";
import {Sound} from "./Models/SaltyChat/Sound";
import {VoiceClientServer} from "./Models/SaltyChat/VoiceClientServer";
import {VoiceClient} from "./Models/SaltyChat/VoiceClient";
// Enums
import {Command} from "./Enum/SaltyChat/Command";
import {GameInstanceState} from "./Enum/SaltyChat/GameInstanceState";
import {RadioType} from "./Enum/SaltyChat/RadioType";
// Event enums
import {FromServer} from "./Enum/Events/FromServer";
import {FromClient} from "./Enum/Events/FromClient";
import {ToClient} from "./Enum/Events/ToClient";
import {ToServer} from "./Enum/Events/ToServer";

export class SaltyVoice {
    private static _instance: SaltyVoice = null;
    private _configuration: Configuration;
    private _clientIdMap = new Map<string, number>();
    private _radioConfiguration: RadioConfiguration = new RadioConfiguration;
    private _soundState: SoundState = new SoundState;
    private _gameInstanceState: GameInstanceState = GameInstanceState.notInitiated;
    private _voiceRange: number;
    private _webView: alt.WebView;

    public get serverIdentifier(): string {
        return this._configuration ? this._configuration.serverIdentifier : null;
    };

    public VoiceClients = new Map<number, VoiceClient>();

    private constructor() {
        if (SaltyVoice._instance != null) return;
        // Server events
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

        // Client events
        alt.on(FromClient.useRadio, this.onClientUseRadio.bind(this));
        alt.on(FromClient.useMegaphone, this.onClientUseMegaphone.bind(this));
        alt.on(FromClient.toggleRange, this.onClientToggleRange.bind(this));
        alt.on(FromClient.setRadioVolume, this.onClientSetRadioVolume.bind(this));
        alt.on(FromClient.toggleRadioSpeaker, this.onClientToggleRadioSpeaker.bind(this));
        alt.on(FromClient.playSound, this.onClientPlaySound.bind(this));
        alt.on(FromClient.stopSound, this.onClientStopSound.bind(this));

        // Anims & timer
        alt.setInterval(this.onTick.bind(this), 250);
        loadAnimDict("random@arrests").catch((rej) => alt.logError(rej));
        loadAnimDict("mp_facial").catch((rej) => alt.logError(rej));
        loadAnimDict("facials@gen_male@variations@normal").catch((rej) => alt.logError(rej));

        // WebView
        this._webView = new alt.WebView("http://resource/Client/Public/websocket.html");
        this._webView.on("onMessage", this.onMessage.bind(this));
        this._webView.on("onError", this.onError.bind(this));
        this._webView.on("onConnected", this.onConnected.bind(this));
        this._webView.on("onDisconnected", this.onDisconnected.bind(this));
    }

    public static GetInstance(): SaltyVoice {
        if (SaltyVoice._instance == null) SaltyVoice._instance = new SaltyVoice();
        return SaltyVoice._instance;
    }

    private onServerInitialize(configuration: Configuration): void {
        this._configuration = configuration;
        this._voiceRange = configuration.voiceRanges[1];

        if (this._gameInstanceState == GameInstanceState.connected) this.initializePlugin();
        else {
            let interval = alt.setInterval(() => {
                if (this._gameInstanceState != GameInstanceState.connected) return;
                alt.clearInterval(interval);
                this.initializePlugin();
            }, 500);
        }
        if (Config.enableOverlay && this._gameInstanceState <= GameInstanceState.notConnected) {
            this._webView.emit("showOverlay", true, Config.overlayLanguage, Config.overlayAddress);
        }
    }

    private onServerSyncClients(voiceClients: VoiceClientServer[]): void {
        this.VoiceClients.clear();
        this._clientIdMap.clear();
        voiceClients.forEach((client) => {
            this.onServerUpdateClient(
                alt.Player.getByID(client.id),
                client.teamSpeakName,
                client.voiceRange,
                client.isAlive,
                client.position
            );
        });
    }

    private onServerUpdateClient(player: alt.Player, teamSpeakName: string, voiceRange: number, isAlive: boolean, position: alt.Vector3): void {
        let voiceClient = new VoiceClient(player, teamSpeakName, voiceRange, isAlive, position);
        this.VoiceClients.set(player.id, voiceClient);
        this._clientIdMap.set(teamSpeakName, player.id);
    }

    private onServerUpdateClientAlive(player: alt.Player, isAlive: boolean): void {
        if (!this.VoiceClients.has(player.id)) return;
        let voiceClient = this.VoiceClients.get(player.id);
        voiceClient.isAlive = isAlive;
    }

    private onServerUpdateClientRange(player: alt.Player, voiceRange: number): void {
        if (!this.VoiceClients.has(player.id)) return;
        let voiceClient = this.VoiceClients.get(player.id);
        voiceClient.voiceRange = voiceRange;
    }

    private onServerRemoveClient(playerId: number): void {
        if (!this.VoiceClients.has(playerId)) return;
        let voiceClient = this.VoiceClients.get(playerId);
        this.executeCommand(new PluginCommand(Command.removePlayer, this.serverIdentifier, new PlayerState(voiceClient.teamSpeakName)));
        this.VoiceClients.delete(playerId);
        this._clientIdMap.delete(voiceClient.teamSpeakName);
    }

    // Phone
    private onServerPhoneEstablish(player: alt.Player, position: alt.Vector3): void {
        if (!this.VoiceClients.has(player.id)) return;
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

        this.executeCommand(
            new PluginCommand(
                Command.phoneCommunicationUpdate,
                this.serverIdentifier,
                new PhoneCommunication(
                    voiceClient.teamSpeakName,
                    true,
                    signalDistortion
                )
            )
        )
    }

    private onServerPhoneEnd(playerId: number): void {
        if (!this.VoiceClients.has(playerId)) return;
        let voiceClient = this.VoiceClients.get(playerId);
        this.executeCommand(
            new PluginCommand(
                Command.stopPhoneCommunication,
                this.serverIdentifier,
                new PhoneCommunication(
                    voiceClient.teamSpeakName,
                    true
                )
            )
        );
    }

    // Radio
    private onServerRadioSetChannel(radioChannel: string, isPrimary: boolean): void {
        if (isPrimary) this._radioConfiguration.primaryChannel = radioChannel;
        else this._radioConfiguration.secondaryChannel = radioChannel;
        alt.emit(ToClient.radioChanged, radioChannel, isPrimary);
        if (Config.enableRadioSound) this.playSound("enterRadioChannel", false, "radio");
    }

    private onServerRadioLeaveChannel(radioChannel: string): void {
        if (this._radioConfiguration.primaryChannel == radioChannel) {
            this._radioConfiguration.primaryChannel = null;
            alt.emit(ToClient.radioChanged, true, null);
        } else if (this._radioConfiguration.secondaryChannel == radioChannel) {
            this._radioConfiguration.secondaryChannel = null;
            alt.emit(ToClient.radioChanged, false, null);
        }
        if (Config.enableRadioSound) this.playSound("leaveRadioChannel", false, "radio");
    }

    private onServerPlayerIsSending(player: alt.Player, radioChannel: string, isSending: boolean, stateChange: boolean, position: alt.Vector3): void {
        this.onServerPlayerIsSendingRelayed(player, radioChannel, isSending, stateChange, position, true, []);
    }

    private onServerPlayerIsSendingRelayed(player: alt.Player, radioChannel: string, isSending: boolean, stateChange: boolean, position: alt.Vector3, direct: boolean, relays: string[]): void {
        let teamspeakName;
        if (player == alt.Player.local) teamspeakName = this._configuration.teamSpeakName;
        else if (this.VoiceClients.has(player.id)) {
            let voiceClient = this.VoiceClients.get(player.id);
            if (voiceClient.distanceCulled) {
                voiceClient.lastPosition = position;
                voiceClient.SendPlayerStateUpdate();
            }
            teamspeakName = voiceClient.teamSpeakName;
        } else return;

        if (isSending) {
            this.executeCommand(
                new PluginCommand(
                    Command.radioCommunicationUpdate,
                    this.serverIdentifier,
                    new RadioCommunication(
                        teamspeakName,
                        Config.radioRange,
                        Config.radioRange,
                        stateChange,
                        this._radioConfiguration.secondaryChannel == radioChannel,
                        direct,
                        relays,
                        this._radioConfiguration.volume
                    )
                )
            );
        } else {
            this.executeCommand(
                new PluginCommand(
                    Command.stopRadioCommunication,
                    this.serverIdentifier,
                    new RadioCommunication(
                        teamspeakName,
                        RadioType.none,
                        RadioType.none,
                        stateChange,
                        this._radioConfiguration.secondaryChannel == radioChannel,
                        direct
                    )
                )
            );
        }
    }

    private onServerUpdateRadioTowers(radioTowers: alt.Vector3[]): void {
        this._configuration.radioTowers = radioTowers;
        if (this._gameInstanceState != GameInstanceState.connected) return;
        this.executeCommand(new PluginCommand(Command.radioTowerUpdate, this.serverIdentifier, new RadioTower(radioTowers)));
    }

    // Megaphone
    private onServerIsUsingMegaphone(player: alt.Player, range: number, isSending: boolean, position: alt.Vector3): void {
        let name: string = null;
        if (player.id == alt.Player.local.id) {
            name = this._configuration.teamSpeakName;
            this._soundState.usingMegaphone = isSending;
        } else if (this.VoiceClients.has(player.id)) {
            let voiceClient = this.VoiceClients.get(player.id);
            if (voiceClient.distanceCulled) {
                voiceClient.lastPosition = position;
                voiceClient.SendPlayerStateUpdate();
            }
            name = voiceClient.teamSpeakName;
        } else return;

        this.executeCommand(
            new PluginCommand(
                isSending ? Command.megaphoneCommunicationUpdate : Command.stopMegaphoneCommunication,
                this.serverIdentifier,
                new MegaphoneCommunication(name, range)
            )
        );
    }

    // Websocket
    private onConnected(): void {
        this._gameInstanceState = GameInstanceState.connected;
        alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
        if (this.serverIdentifier) this.initializePlugin();
    }

    private onDisconnected(): void {
        this._gameInstanceState = GameInstanceState.notConnected;
        alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
        this.initializePlugin();
    }

    private onMessage(messageJson: string): void {
        let message = JSON.parse(messageJson);
        if (message.ServerUniqueIdentifier != this.serverIdentifier) return;
        switch (message.Command) {
            case Command.pluginState:
                alt.emitServer(ToServer.checkVersion, message.Parameter.Version);
                this.executeCommand(new PluginCommand(Command.radioTowerUpdate, this.serverIdentifier, new RadioTower(this._configuration.radioTowers)));
                break;
            case Command.reset:
                this._gameInstanceState = GameInstanceState.notInitiated;
                alt.emit(ToClient.stateChanged, this._gameInstanceState, this._soundState.microphone, this._soundState.speaker);
                this.initializePlugin();
                break;
            case Command.ping:
                this.executeCommand(new PluginCommand(Command.pong, this.serverIdentifier));
                break;
            case Command.instanceState:
                this._gameInstanceState = message.Parameter.State;
                if (Config.enableOverlay) {
                    if (this._gameInstanceState <= GameInstanceState.notConnected) {
                        this._webView.emit("showOverlay", true, Config.overlayLanguage, Config.overlayAddress);
                    } else {
                        this._webView.emit("showOverlay", false);
                    }
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

    private onError(error: object): void {
        alt.logError(JSON.stringify(error));
    }

    public executeCommand(command: PluginCommand): void {
        this._webView.emit("runCommand", JSON.stringify(command));
    }

    // Sound

    private playSound(fileName: string, loop: boolean = false, handle: string = null): void {
        if (!handle) handle = fileName;
        this.executeCommand(
            new PluginCommand(
                Command.playSound,
                this.serverIdentifier,
                new Sound(fileName, loop, handle)
            )
        );
    }

    private stopSound(handle: string): void {
        this.executeCommand(
            new PluginCommand(
                Command.stopSound,
                this.serverIdentifier,
                new Sound(handle)
            )
        );
    }

    // Internals
    private onTick(): void {
        if (alt.Player.local.health > 100) this.controlTick();
        this.stateUpdateTick();
    }

    private controlTick(): void {
        if (!alt.Player.local.vehicle && this._soundState.usingMegaphone) {
            alt.emitServer(ToServer.isUsingMegaphone, false);
        }
    }

    private stateUpdateTick(): void {
        if (this._gameInstanceState <= 0 || !this._configuration) return;
        let playerStates = [];

        let localRoomId = native.getRoomKeyFromEntity(alt.Player.local.scriptID);

        this.VoiceClients.forEach((voiceClient) => {
            let nextPlayer = voiceClient.player;
            if (!nextPlayer.valid) return;
            if (nextPlayer.scriptID == 0) {
                if (!voiceClient.distanceCulled) {
                    voiceClient.distanceCulled = true;
                    playerStates.push(new PlayerState(
                        voiceClient.teamSpeakName,
                        voiceClient.lastPosition,
                        voiceClient.voiceRange,
                        voiceClient.isAlive,
                        voiceClient.distanceCulled,
                        null
                    ))
                }
            } else {
                if (voiceClient.distanceCulled) voiceClient.distanceCulled = false;
                voiceClient.lastPosition = nextPlayer.pos;

                let muffleIntensity = null;
                if (Config.enableMuffling) {
                    let npRoomId = native.getRoomKeyFromEntity(nextPlayer.scriptID);

                    if (localRoomId != npRoomId && !native.hasEntityClearLosToEntity(alt.Player.local.scriptID, nextPlayer.scriptID, 17)) {
                        muffleIntensity = 10;
                    } else {
                        let pVehicle = alt.Player.local.vehicle;
                        let nVehicle = nextPlayer.vehicle;
                        if (pVehicle != nVehicle && (pVehicle != null && nVehicle != null)) {
                            if (!hasOpening(pVehicle)) muffleIntensity += 4;
                            if (!hasOpening(nVehicle)) muffleIntensity += 4;
                        }
                    }
                }

                playerStates.push(
                    new PlayerState(
                        voiceClient.teamSpeakName,
                        voiceClient.lastPosition,
                        voiceClient.voiceRange,
                        voiceClient.isAlive,
                        voiceClient.distanceCulled,
                        muffleIntensity
                    )
                );
            }
        });

        this.executeCommand(
            new PluginCommand(
                Command.bulkUpdate,
                this.serverIdentifier,
                new BulkUpdate(
                    playerStates,
                    new SelfState(
                        alt.Player.local.pos,
                        native.getGameplayCamRot(0).z
                    )
                )
            )
        )
    }

    private setPlayerTalking(teamSpeakName: string, isTalking: boolean): void {
        let playerId = null;
        if (teamSpeakName == this._configuration.teamSpeakName) playerId = alt.Player.local.scriptID;
        else {
            let voiceClient = this.VoiceClients.get(this._clientIdMap.get(teamSpeakName));
            if (voiceClient != null) playerId = voiceClient.player.scriptID;
        }

        if (playerId && Config.enableLipSync) {
            if (isTalking) native.playFacialAnim(playerId, "mic_chatter", "mp_facial");
            else native.playFacialAnim(playerId, "mood_normal_1", "facials@gen_male@variations@normal");
        }
    }

    private initializePlugin(): void {
        this.executeCommand(
            new PluginCommand(
                Command.initiate,
                this.serverIdentifier,
                new GameInstance(
                    this.serverIdentifier,
                    this._configuration.teamSpeakName,
                    this._configuration.ingameChannel,
                    this._configuration.ingameChannelPassword,
                    this._configuration.soundPack,
                    this._configuration.swissChannels,
                    this._configuration.requestTalkStates,
                    this._configuration.requestRadioTrafficStates
                )
            )
        );
    }

    // Exports

    private onClientUseRadio(primaryRadio: boolean, isSending: boolean): void {
        if (primaryRadio) {
            if (isSending != this._radioConfiguration.usingPrimaryRadio) {
                alt.emitServer(ToServer.playerIsSending, this._radioConfiguration.primaryChannel, isSending);
                if (isSending && Config.enableRadioAnimation) native.taskPlayAnim(alt.Player.local.scriptID, "random@arrests", "generic_radio_enter", 2, 2, -1, 50, 1, false, false, false);
                else native.clearPedTasks(alt.Player.local.scriptID);
                this._radioConfiguration.usingPrimaryRadio = isSending;
            }
        } else {
            if (isSending != this._radioConfiguration.usingSecondaryRadio) {
                alt.emitServer(ToServer.playerIsSending, this._radioConfiguration.secondaryChannel, isSending);
                if (isSending && Config.enableRadioAnimation) native.taskPlayAnim(alt.Player.local.scriptID, "random@arrests", "generic_radio_enter", 2, 2, -1, 50, 1, false, false, false);
                else native.clearPedTasks(alt.Player.local.scriptID);
                this._radioConfiguration.usingSecondaryRadio = isSending;
            }
        }
    }

    private onClientUseMegaphone(isSending: boolean): void {
        this._soundState.usingMegaphone = isSending;
        alt.emitServer(ToServer.isUsingMegaphone, isSending);
    }

    private onClientToggleRange(): void {
        let newIndex;
        let index = this._configuration.voiceRanges.indexOf(this._voiceRange);
        if (index < 0) newIndex = 1;
        else if (index + 1 >= this._configuration.voiceRanges.length) newIndex = 0;
        else newIndex = index + 1;
        this._voiceRange = this._configuration.voiceRanges[newIndex];

        alt.emitServer(ToServer.setRange, this._voiceRange);
        alt.emit(ToClient.voiceRangeChanged, this._voiceRange, newIndex);
    }

    private onClientSetRadioVolume(volume: number): void {
        if (volume < 0) volume = 0;
        else if (volume > 1.6) volume = 1.6;
        this._radioConfiguration.volume = volume;
    }

    private onClientToggleRadioSpeaker(): void {
        this._radioConfiguration.speakerEnabled = !this._radioConfiguration.speakerEnabled;
        alt.emitServer(ToServer.toggleRadioSpeaker, this._radioConfiguration.speakerEnabled);
    }

    private onClientPlaySound(fileName: string, loop: boolean = false, handle: string = null): void {
        this.playSound(fileName, loop, handle);
    }

    private onClientStopSound(handle: string): void {
        this.stopSound(handle);
    }
}

SaltyVoice.GetInstance();