export class PluginCommand {
    constructor(command, serverUniqueIdentifier, parameter) {
        this.command = command;
        this.serverUniqueIdentifier = serverUniqueIdentifier;
        if (parameter)
            this.parameter = parameter;
    }
}
