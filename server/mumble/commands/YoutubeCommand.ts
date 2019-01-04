import BaseCommand from "./BaseCommand"
import { User } from "mumble";

class YoutubeCommand extends BaseCommand {
  private commands = ['yt', 'pyt', 'youtube', 'playyoutube']

  shouldExecute(message: string[]): Boolean {
    return this.mumble.voteHappening && this.commands.includes(message[0])
  }
  
  execute(message: string[], user: User): void {
    const request = message[0].startsWith('p')
    if (message.length < 2) {
      this.sendMessage('Invalid ' + message[0] + ' command!')
    } else {
      message.shift()
      var result = message.join(' ').replace(/(<([^>]+)>)/ig, '')

      this.sendMessage(`Adding ${result} from ${user.name}`)
      this.mumble.uploadYoutube(result, request)
    }
  }
}

export default YoutubeCommand
