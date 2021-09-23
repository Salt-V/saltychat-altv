export enum Command {
    // Plugin
    pluginState = 0,
    initiate = 1,
    reset = 2,
    ping = 3,
    pong = 4,
    instanceState = 5,
    soundState = 6,
    selfStateUpdate = 7,
    playerStateUpdate = 8,
    bulkUpdate = 9,
    removePlayer = 10,
    talkState = 11,
    // Sounds
    playSound = 18,
    stopSound = 19,
    // Phone
    phoneCommunicationUpdate = 20,
    stopPhoneCommunication = 21,
    // Radio
    radioCommunicationUpdate = 30,
    stopRadioCommunication = 31,
    radioTowerUpdate = 32,
    radioTrafficState = 33,

    addRadioChannelMember = 37,
    updateRadioChannelMembers = 38,
    removeRadioChannelMember,
    // Megaphone
    megaphoneCommunicationUpdate = 40,
    stopMegaphoneCommunication = 41
}