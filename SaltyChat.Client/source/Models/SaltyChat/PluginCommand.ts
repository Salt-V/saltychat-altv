import { Command } from "../../Enum/SaltyChat/Command";

export class PluginCommand {
    public command: Command;
    public serverUniqueIdentifier: string;
    public parameter: any;

    constructor(command: Command, parameter?: any) {
        this.command = command;
        if (parameter) this.parameter = parameter;
    }
}