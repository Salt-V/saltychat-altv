export class Sound {
    filename;
    isLoop;
    handle;
    constructor(fileName, loop, handle) {
        this.filename = fileName;
        this.isLoop = loop;
        this.handle = handle ? handle : fileName;
    }
}
