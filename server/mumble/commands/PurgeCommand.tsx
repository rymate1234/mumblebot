import BaseCommand from "./BaseCommand"
import { User } from "mumble";
import { render } from "preact-render-to-string";

class PurgeCommand extends BaseCommand {
  private commands = ['purge']

  shouldExecute(message: string[]): Boolean {
    return !this.mumble.voteHappening && this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    const purgeMessage = render(
      <p>
        Calling a vote to purge the queue of songs<br />
        Use voteyes and voteno to vote! 10 Seconds to vote...
      </p>
    )

    this.sendMessage(purgeMessage)
    this.mumble.handleVote(() => {
      this.mumble.stopSong()
      this.mumble.queue.reset()
    })
  }
}

export default PurgeCommand
