export class PluginCommand {
    command;
    serverUniqueIdentifier;
    parameter;
    constructor(command, parameter) {
        this.command = command;
        if (parameter)
            this.parameter = parameter;
    }
}
