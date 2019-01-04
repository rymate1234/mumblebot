import BaseCommand from "./BaseCommand"
import { User } from 'mumble'
import fs from 'fs'

class MemeCommand extends BaseCommand {
  private memePlaying = false
  private assetsFolder = './assets/'
  private currentFile: string
  private memeFile: any;

  shouldExecute(message: string[]): boolean {
    const files = fs.readdirSync(this.assetsFolder)
    const index = files.findIndex((f, i, o) => {
      if (f.includes(message[0])) {
        return true
      }
    })

    this.currentFile = files[index]
    
    return !this.memePlaying && index !== -1
  }

  execute(message: string[], user: User): void {
    if (!this.currentFile) return

    this.memeFile = this.mumble.getFfmpegInstance(this.assetsFolder + this.currentFile, () => {
      this.memePlaying = false
    })

    this.memePlaying = true

    const memeInput = this.mumble.mixer.input({
      channels: 2,
      sampleRate: 44100
    })

    this.memeFile.stream(memeInput)
  }
}

export default MemeCommand