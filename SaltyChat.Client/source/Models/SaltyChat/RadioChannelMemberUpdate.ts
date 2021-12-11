export class RadioChannelMemberUpdate {
  public playerNames: string[];
  public isPrimaryChannel: boolean;

  constructor(playerNames: string[], isPrimaryChannel: boolean) {
    this.playerNames = playerNames;
    this.isPrimaryChannel = isPrimaryChannel;
  }
}
