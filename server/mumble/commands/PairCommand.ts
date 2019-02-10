import BaseCommand from "./BaseCommand"
import { User } from "mumble";

class NoCommand extends BaseCommand {
  private commands = ['pair']

  shouldExecute(message: string[]): boolean {
    return this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    if (message.length != 2) {
      this.sendMessage("Invalid pair command! Try: pair code")
    } else {
      const basic = {
        name: user.name,
        hash: user.hash
      }
      this.mumble.sendToMaster({ type: 'attempt-pair', code: message[1], user: basic })
    }
  }
}

export default NoCommand