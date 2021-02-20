import BaseCommand from './BaseCommand'
import { User } from 'mumble'
import { render } from 'preact-render-to-string'
import { h } from 'preact'

class VolumeCommand extends BaseCommand {
  private commands = ['volume', 'vol']

  shouldExecute(message: string[]): boolean {
    return !this.mumble.voteHappening && this.commands.includes(message[0])
  }

  execute(message: string[], user: User): void {
    if (this.mumble.inputStream == null) {
      this.sendMessage('Nothing is playing currently!')
    } else if (message.length > 2) {
      this.sendMessage('Invalid Volume Command!')
    } else if (message.length === 1) {
      this.sendMessage('Volume is currently ' + this.mumble.currentVolume * 4)
    } else {
      let volume: number = Number.parseFloat(message[1])

      if (volume > 1 || volume < 0) {
        this.sendMessage('Volume must be between 0 and 1!')
        return
      }

      volume = volume / 4

      const voteMessage = (
        <p>
          Calling a vote to change volume to {message[1]}
          <br />
          Use voteyes and voteno to vote! 10 Seconds to vote...
        </p>
      )

      this.sendMessage(render(voteMessage))
      this.mumble.handleVote(() => {
        this.mumble.inputStream.gain = volume
        this.mumble.currentVolume = volume
      })
    }
  }
}

export default VolumeCommand
