import BaseCommand from "./BaseCommand";
import { User } from 'mumble'
import fs from 'fs'
import { join } from 'path'

class BbcCommand extends BaseCommand {
  private bbc: boolean;
  private commands = ['beeb', 'bbc']

  shouldExecute(message: string[]): boolean {
    return !this.bbc && this.commands.includes(message[0])
  }

  execute(message: string[], user: User): void {
    this.randomFile('data/bbc/', (err, file) => {
      if (err) return

      var memeFile = this.mumble.getFfmpegInstance('bbc/' + file, () => {
        this.bbc = false
      })
      this.bbc = true

      var memeInput = this.mumble.mixer.input({
        channels: 2,
        sampleRate: 44100
      })

      memeFile.stream(memeInput)
    })
  }

  randomFile (dir: string, callback: { (err: any, file: any): void; }) {
    fs.readdir(dir, (err, files) => {
      if (err) return callback(err, null)

      function checkRandom () {
        if (!files.length) {
          // callback with an empty string to indicate there are no files
          return callback(null, null)
        }
        const randomIndex = Math.floor(Math.random() * files.length)
        const file = files[randomIndex]
        fs.stat(join(dir, file), (err, stats) => {
          if (err) return callback(err, null)
          if (stats.isFile()) {
            return callback(null, file)
          }
          // remove this file from the array because for some reason it's not a file
          files.splice(randomIndex, 1)

          // try another random one
          checkRandom()
        })
      }
      checkRandom()
    })
  }
}

export default BbcCommand
