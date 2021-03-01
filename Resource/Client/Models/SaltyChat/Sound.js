export class Sound {
    constructor(fileName, loop, handle) {
        this.filename = fileName;
        this.isLoop = loop;
        this.handle = handle ? handle : fileName;
    }
}
