import { Command } from "../../Enum/SaltyChat/Command";

export class PluginCommand {
    public command: Command;
    public serverUniqueIdentifier: string;
    public parameter: any;

    constructor(command: Command, serverUniqueIdentifier: string, parameter?: any) {
        this.command = command;
        this.serverUniqueIdentifier = serverUniqueIdentifier;
        if (parameter) this.parameter = parameter;
    }
}