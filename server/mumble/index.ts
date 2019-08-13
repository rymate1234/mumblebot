import { Mumble } from './mumble'
import StopCommand from './commands/StopCommand'

let mumbleClient: Mumble = null
module.exports = function (input, done, send) {
  if (mumbleClient === null) {
    mumbleClient = new Mumble(send)
    mumbleClient.connect()
  }

  if (input === undefined || input.action === null) {
    return done()
  }

  if (input.action === 'status') {
    return done(mumbleClient.getStatus())
  } else if (input.action === 'request') {
    if (mumbleClient.voteHappening) {
      return done()
    }
    console.log(input.payload)
    mumbleClient.callVote(input.payload)
  } else if (input.action === 'youtube') {
    mumbleClient.uploadYoutube(input.payload, false)
  } else if (input.action === 'stopsong') {
    var stoppy = new StopCommand(mumbleClient);
    stoppy.execute(null,null);
  
    stoppy = null;
  }
}
