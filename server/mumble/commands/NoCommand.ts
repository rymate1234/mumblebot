import BaseCommand from "./BaseCommand"
import { User } from "mumble";

class NoCommand extends BaseCommand {
  private commands = ['voteyes', 'yes', 'y']

  shouldExecute(message: string[]): Boolean {
    return this.mumble.voteHappening && this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    if (this.mumble.noVotes.includes(user.hash)) {
      this.sendMessage("You've already voted!")
    } else {
      if (this.mumble.yesVotes.includes(user.hash)) {
        this.sendMessage('Changing your vote from no to yes!')
        this.mumble.yesVotes = this.mumble.yesVotes.filter(hash => hash === user.hash)
      }
      this.mumble.noVotes.push(user.hash)
    }
  }
}

export default NoCommand
