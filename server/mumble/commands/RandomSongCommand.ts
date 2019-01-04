import BaseCommand from "./BaseCommand"
import { User } from 'mumble'

class RandomSongCommand extends BaseCommand {
  private commands = ['random', 'idk']

  shouldExecute(message: string[]): boolean {
    return !this.mumble.voteHappening && this.commands.includes(message[0])
  }

  execute(message: string[], user: User): void {
    this.mumble.db.find().sort({ date: -1 }).toArray((err, docs) => {
      if (err) {
        console.log(err)
        return
      }
      const picked = Math.floor(Math.random() * docs.length) + 1
      const songs = docs[picked]
      const request = { 'path': songs.path }
      this.mumble.callVote(request)
    })
  }
}

export default RandomSongCommand