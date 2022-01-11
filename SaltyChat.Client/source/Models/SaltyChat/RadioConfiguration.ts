export class RadioConfiguration {
    public primaryChannel: string;
    public primaryChangeHandlerCookies: number[];
    public secondaryChannel: string;
    public SecondaryChangeHandlerCookies: number[];
    public volume: number = 1;
    public usingPrimaryRadio: boolean;
    public usingSecondaryRadio: boolean;
    public speakerEnabled: boolean;
}