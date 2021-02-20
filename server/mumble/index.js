require('@babel/register')({
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
})
const { expose } = require('threads/worker')
const { Observable } = require('observable-fns')
const { Mumble } = require('./mumble')

let mumbleClient = null

const object = {
  initialise() {
    if (mumbleClient === null) {
      try {
        mumbleClient = new Mumble()
        mumbleClient.connect()
      } catch (e) {
        throw e
      }
    }

    return new Observable((observer) => {
      mumbleClient.setObserver(observer)
    })
  },
  status() {
    return mumbleClient.getStatus()
  },
  request(payload) {
    if (mumbleClient.voteHappening) {
      return
    }

    mumbleClient.callVote(payload)
  },
  youtube(payload) {
    if (mumbleClient.voteHappening) {
      return
    }

    mumbleClient.uploadYoutube(payload, false)
  },
}

expose(object)
