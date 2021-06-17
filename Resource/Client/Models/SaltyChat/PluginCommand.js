export class PluginCommand {
    constructor(command, parameter) {
        this.command = command;
        if (parameter)
            this.parameter = parameter;
    }
}
