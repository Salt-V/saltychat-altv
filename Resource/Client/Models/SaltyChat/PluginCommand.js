export class PluginCommand {
    command;
    serverUniqueIdentifier;
    parameter;
    constructor(command, parameter, serverUniqueIdentifier) {
        this.command = command;
        if (parameter)
            this.parameter = parameter;
        if (serverUniqueIdentifier)
            this.serverUniqueIdentifier = serverUniqueIdentifier;
    }
}
