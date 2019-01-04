import { Mumble } from '../mumble'
import { User } from 'mumble';

abstract class BaseCommand {
  constructor (protected mumble: Mumble) {}
  abstract shouldExecute(message: string[]): boolean 
  abstract execute(message: string[], user: User): void;

  protected sendMessage(message: string): void {
    this.mumble.sendMessage(message)
  }
}

export default BaseCommand
