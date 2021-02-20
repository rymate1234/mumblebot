import BaseCommand from './BaseCommand'
import { User } from 'mumble'

class NoCommand extends BaseCommand {
  private commands = ['voteno', 'no', 'n']

  shouldExecute(message: string[]): boolean {
    return this.mumble.voteHappening && this.commands.includes(message[0])
  }

  execute(message: string[], user: User): void {
    if (this.mumble.noVotes.includes(user.hash)) {
      this.sendMessage("You've already voted!")
    } else {
      if (this.mumble.yesVotes.includes(user.hash)) {
        this.sendMessage('Changing your vote from yes to no!')
        this.mumble.yesVotes = this.mumble.yesVotes.filter(
          (hash) => hash !== user.hash
        )
      }
      this.mumble.noVotes.push(user.hash)
    }
  }
}

export default NoCommand
