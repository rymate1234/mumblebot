import BaseCommand from "./BaseCommand"
import { User } from "mumble";
import { render } from "preact-render-to-string";
import { h } from 'preact'

class StopCommand extends BaseCommand {
  private commands = ['stopsong', 'stop']

  shouldExecute(message: string[]): boolean {
    return !this.mumble.voteHappening && this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    const voteMessage = render(
      <p>
        Someone has requested to stop the song: {this.mumble.playingSong.name}<br />
        Use voteyes and voteno to vote! 10 Seconds to vote...
      </p>
    )
    this.sendMessage(voteMessage)
    this.mumble.handleVote(() => this.mumble.stopSong())
  }
}

export default StopCommand
