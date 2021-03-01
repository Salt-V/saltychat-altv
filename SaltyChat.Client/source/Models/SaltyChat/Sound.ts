export class Sound {
    public filename: string;
    public isLoop: boolean;
    public handle: string;

    constructor(fileName: string, loop?: boolean, handle?: string) {
        this.filename = fileName;
        this.isLoop = loop;
        this.handle = handle ? handle : fileName;
    }
}