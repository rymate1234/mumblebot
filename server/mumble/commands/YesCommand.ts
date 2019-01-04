import BaseCommand from "./BaseCommand"
import { User } from "mumble";

class YesCommand extends BaseCommand {
  private commands = ['voteyes', 'yes', 'y']

  shouldExecute(message: string[]): boolean {
    return this.mumble.voteHappening && this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    if (this.mumble.yesVotes.includes(user.hash)) {
      this.sendMessage("You've already voted!")
    } else {
      if (this.mumble.noVotes.includes(user.hash)) {
        this.sendMessage('Changing your vote from no to yes!')
        this.mumble.noVotes = this.mumble.noVotes.filter(hash => hash !== user.hash)
      }
      this.mumble.yesVotes.push(user.hash)
    }
  }
}

export default YesCommand
