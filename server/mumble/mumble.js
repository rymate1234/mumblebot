'use strict'
import { join } from 'path'
import { connect as _connect } from 'mumble'
import Queue from './queue'
import { readFileSync, readdir, stat } from 'fs'
import Mixer from 'audio-mixer'
import dbconn from '../database'
import { server, username, password } from '../../config.js'
import { h } from 'preact'
import render from 'preact-render-to-string'

import ytdl from 'ytdl-core'
import ffmpeg, { ffprobe } from 'fluent-ffmpeg'
import normaliseSong from '../../shared/util/normalise-song'

const options = {
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem')
}

const DEFAULT_VOL = 0.125

export class Mumble {
  currentFile = {}
  inputStream = {}

  mixer = new Mixer({
    channels: 2,
    sampleRate: 44100
  })

  playingSong = {}
  yesVotes = []
  noVotes = []
  queue = new Queue()
  voteHappening = false
  currentVolume = DEFAULT_VOL
  db = {}

  connect () {
    dbconn((err, data) => {
      if (err !== null) {
        return
      }

      this.db = data.collection('songs')
    })

    console.log('Connecting')

    _connect(server, options, (error, connection) => {
      if (error) {
        throw new Error(error)
      }

      console.log('Connected')

      connection.authenticate(username, password)
      this.client = connection

      connection.on('initialized', () => {
        console.log('Connection initialized')
        this.sendMessage('...aaaaaand we\'re back!')
        this.sendMessage('Loaded MumbleBot!')
        this.client.connection.sendMessage('UserState', {
          session: this.client.user.session,
          actor: this.client.user.session,
          comment: render(
            <div>
              <h1>Welcome to MumbleBot</h1>
              <p>To request a song, head to <a href='http://rymate.co.uk/mumble/'>http://rymate.co.uk/mumble/</a></p>
            </div>
          )
        })
      })

      this.inputStream = this.client.inputStream({
        channels: 2,
        sampleRate: 44100,
        gain: this.currentVolume
      })
      this.mixer.pipe(this.inputStream)

      // On text message...
      connection.on('message', (message, user) => {
        const format = date => `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`

        console.log(`${format(new Date())} <${user.name}> ${message}`)
        this.handleMessage(message, user)
      })

      this.connected = true
    })
  }

  getStatus () {
    var status = {}
    status.playing = this.playing
    status.nowPlaying = this.playingSong.name || this.playingSong.title
    status.queue = this.queue.getArray()
    status.users = this.client.users().map(user => user.name)

    return status
  }

  setComment () {
    var message
    if (this.playingSong) {
      message = (
        <div>
          <h1>Now Playing:</h1>
          <p>{this.playingSong.name || this.playingSong.title}</p>
          <p>To request a song, head to <a href='http://rymate.co.uk/mumble/'>http://rymate.co.uk/mumble/</a></p>
        </div>
      )
    } else {
      message = (
        <div>
          <h1>No songs currently playing</h1>
          <p>To request a song, head to <a href='http://rymate.co.uk/mumble/'>http://rymate.co.uk/mumble/</a></p>
        </div>
      )
    }

    this.client.connection.sendMessage('UserState', {
      session: this.client.user.session,
      actor: this.client.user.session,
      comment: render(message)
    })
  }

  sendMessage (message) {
    this.client.user.channel.sendMessage(message)
  }

  handleMessage (message, user) {
    const regex = /(<([^>]+)>)/ig
    message = message.replace(regex, '').split(' ')
    switch (message[0].toLowerCase()) {
      case 'voteyes':
      case 'yes':
      case 'y':
        if (this.yesVotes.includes(user.hash)) {
          this.sendMessage("You've already voted!")
        } else {
          if (this.noVotes.includes(user.hash)) {
            this.sendMessage('Changing your vote from no to yes!')
            this.noVotes = this.noVotes.filter(hash => hash === user.hash)
          }
          this.yesVotes.push(user.hash)
        }
        break
      case 'voteno':
      case 'no':
      case 'n':
        if (this.noVotes.includes(user.hash)) {
          this.sendMessage("You've already voted!")
        } else {
          if (this.yesVotes.includes(user.hash)) {
            this.sendMessage('Changing your vote from no to yes!')
            this.yesVotes = this.yesVotes.filter(hash => hash === user.hash)
          }
          this.noVotes.push(user.hash)
        }
        break
      case 'stopsong':
      case 'stop':
        if (this.voteHappening) {
          return
        }

        const voteMessage = render(
          <p>
            Someone has requested to stop the song: {this.playingSong.name}<br />
            Use voteyes and voteno to vote! 10 Seconds to vote...
          </p>
        )
        this.sendMessage(voteMessage)
        this.handleVote(() => this.stopSong())
        break
      case 'volume':
      case 'vol':
        if (this.inputStream == null) {
          this.sendMessage('Nothing is playing currently!')
        } else if (message.length > 2) {
          this.sendMessage('Invalid Volume Command!')
        } else if (message.length === 1) {
          this.sendMessage('Volume is currently ' + this.currentVolume * 4)
        } else {
          if (this.voteHappening) {
            return
          }
          var volume = message[1]

          if (volume > 1 || volume < 0) {
            this.sendMessage('Volume must be between 0 and 1!')
            break
          }

          volume = volume / 4

          const voteMessage = render(
            <p>
              Calling a vote to change volume to {message[1]}<br />
              Use voteyes and voteno to vote! 10 Seconds to vote...
            </p>
          )

          this.sendMessage(voteMessage)
          this.handleVote(() => {
            this.inputStream.gain = volume
            this.currentVolume = volume
          })
        }
        break
      case 'purge':
        if (this.voteHappening) {
          return
        }

        const purgeMessage = render(
          <p>
            Calling a vote to purge the queue of songs<br />
            Use voteyes and voteno to vote! 10 Seconds to vote...
          </p>
        )

        this.sendMessage(purgeMessage)
        this.handleVote(() => {
          this.stopSong()
          this.queue = new Queue()
        })
        break
      case 'yt':
      case 'pyt':
      case 'youtube':
      case 'playyoutube':
        var request = message[0].startsWith('p')
        if (message.length < 2) {
          this.sendMessage('Invalid ' + message[0] + ' command!')
        } else {
          var filter = /(<([^>]+)>)/ig

          message.shift()
          var result = message.join(' ').replace(filter, '')

          this.sendMessage('Adding ' + result)
          this.uploadYoutube(result, request)
        }
        break
      case 'idk':
        this.db.find().sort({ date: -1 }).toArray((err, docs) => {
          if (err) {
            console.log(err)
            return
          }
          var picked = Math.floor(Math.random() * docs.length) + 1
          var songs = docs[picked]
          var done = { 'path': songs.path }
          this.callVote(done)
        })
        break
      case 'meme':
      case 'spooky':
      case 'moan':
        this.playAudioOnKeyWord(message[0].toLowerCase())
        break
      case 'beeb':
        this.playRandBbc()
        break

      default:
        break
    }
  }

  stopSong () {
    if (typeof this.inputStream.close === 'undefined') {
      return
    }

    this.playing = false
    this.playingSong.name = ''
    this.playingSong.input.destroy()
    this.setComment()

    this.currentFile.kill()
    this.currentFile = {}

    setTimeout(() => {
      if (this.queue.getLength() !== 0) this.play(this.Errorqueue.dequeue())
    }, 2000)
  }

  async callVote (filename) {
    if (this.voteHappening) {
      return
    }
    console.log(filename)
    let request

    if (!filename.radio) {
      request = await new Promise((resolve, reject) => this.db.find({ path: filename.path }).toArray((err, docs) => {
        if (err) {
          console.log(err)
          return reject(err)
        }

        var file = docs[0]
        console.log('file gotten', file)
        if (file == null) {
          return reject(new Error('File not found'))
        }

        file.name = file.title
        file.name = escapeHtml(file.name)

        resolve(file)
      }))
    } else {
      request = filename
    }

    const type = filename.radio ? 'station' : 'song'

    this.sendMessage(render(
      <p>
        Someone has requested the following {type}: {request.name || request.title}
        <br />
        Use voteyes and voteno to vote! 10 Seconds to vote...
      </p>
    ))
    this.handleVote(() => this.play(request))
  }

  handleVote (callback) {
    if (this.voteHappening) {
      return
    }

    this.yesVotes = []
    this.noVotes = []
    this.voteHappening = true
    setTimeout(() => {
      if (this.yesVotes.length > this.noVotes.length) {
        this.sendMessage('Vote success! Yes Votes: ' + this.yesVotes.length + ' - No Votes: ' + this.noVotes.length)
        callback()
      } else if (this.yesVotes.length < this.noVotes.length) {
        this.sendMessage('Vote failed! Yes Votes: ' + this.yesVotes.length + ' - No Votes: ' + this.noVotes.length)
      } else if ((this.yesVotes.length === 0) && (this.noVotes.length === 0)) {
        this.sendMessage('No-one cared! Passing vote anyway...')
        callback()
      } else {
        this.sendMessage('Vote failed! Yes Votes: ' + this.yesVotes.length + ' - No Votes: ' + this.noVotes.length)
      }

      this.voteHappening = false
      this.yesVotes = []
      this.noVotes = []
    }, 10000)
  }

  play (filename) {
    if (!this.connected) {
      return
    }

    if (this.playing) {
      this.queue.enqueue(filename)
      return
    }

    if (filename.radio) {
      ffprobe(filename.src.replace(';', ''), (err, metadata) => {
        if (err) {
          console.log(err)
          return
        }
        this.currentFile = this.getFfmpegInstance(filename.src.replace(';', ''), () => {
          console.log('Finished')
        })

        this.playingSong.name = filename.name || filename.title
        this.setPlaying()

        this.playingSong.input = this.mixer.input({
          channels: 2,
          sampleRate: 44100
        })

        this.currentFile.pipe(this.playingSong.input, { end: false })
      })
    } else {
      this.currentFile = this.getFfmpegInstance(filename.path, () => {
        this.playing = false
        if (this.queue.getLength() !== 0) {
          console.log('ended')
          this.play(this.queue.dequeue())
        }
      })

      this.playingSong.input = this.mixer.input({
        channels: 2,
        sampleRate: 44100
      })

      this.currentFile.pipe(this.playingSong.input, { end: true })
      this.playingSong.name = filename.name || filename.title
      this.setPlaying()
    }
  }

  getFfmpegInstance (filename, callback) {
    return ffmpeg(filename)
      .audioChannels(2)
      .renice(5)
      .audioBitrate(128)
      .audioFrequency(44100)
      .format('wav')
      .on('error', function (err) {
        console.log(err)
      })
      .on('end', () => callback())
  }

  setPlaying () {
    const message = (
      <p>
        Now Playing:  {this.playingSong.name}<br />
        To call a vote to stop it, type stopsong in chat.
      </p>
    )
    this.sendMessage(render(message))
    this.setComment()
    this.playing = true
  }

  playAudioOnKeyWord (keyWord) {
    if (this.meme) return

    var memeFile
    switch (keyWord.toLowerCase()) {
      case 'meme':
        memeFile = this.getFfmpegInstance('assets/spicymeme.mp3', () => {
          this.meme = false
        })
        break
      case 'spooky':
        memeFile = this.getFfmpegInstance('assets/spooky.mp3', () => {
          this.meme = false
        })
        break
      case 'moan':
        memeFile = this.getFfmpegInstance('assets/moan.wav', () => {
          this.meme = false
        })
        break
      default:
        console.log('Opps.. playAudioOnKeyWord has failed.. blame pavel')
    }

    this.meme = true

    var memeInput = this.mixer.input({
      channels: 2,
      sampleRate: 44100
    })

    memeFile.stream(memeInput)
  }

  playRandBbc () {
    if (this.bbc) return
    this.randomFile('bbc/', (err, file) => {
      if (err) return

      var memeFile = this.getFfmpegInstance('bbc/' + file, () => {
        this.bbc = false
      })
      this.bbc = true

      var memeInput = this.mixer.input({
        channels: 2,
        sampleRate: 44100
      })

      memeFile.stream(memeInput)
    })
  }

  randomFile (dir, callback) {
    readdir(dir, (err, files) => {
      if (err) return callback(err)

      function checkRandom () {
        if (!files.length) {
          // callback with an empty string to indicate there are no files
          return callback(null, undefined)
        }
        const randomIndex = Math.floor(Math.random() * files.length)
        const file = files[randomIndex]
        stat(join(dir, file), (err, stats) => {
          if (err) return callback(err)
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

  uploadYoutube (url, request) {
    console.log(url)
    if (!url.startsWith('http')) return
    try {
      var youtube = ytdl(url, { filter: 'audioonly' })
      youtube.on('info', info => {
        this.db.find({ path: 'uploads/' + info.video_id }).toArray((err, docs) => {
          if (err) {
            console.log(err)
            return
          }
          console.log(docs)
          if (docs.length === 0) {
            console.log("file doesn't exist")
            var save = ffmpeg()
              .input(youtube)
              .format('mp3')
              .on('error', function (err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message)
              })
              .on('end', () => {
                var details = {}
                var metadata = {}

                metadata.title = info.title
                metadata.artist = info.author

                details.metadata = metadata

                details.filename = info.video_id
                details.date = new Date()

                details.originalname = url
                details.path = 'uploads/' + info.video_id

                details = normaliseSong(details)

                this.db.insertOne(details, function (err, docs) {
                  if (!err) {
                    console.log('Finished processing')

                    if (request) this.callVote({ path: details.path })
                  }
                })
              })
            save.save('./uploads/' + info.video_id)
          } else if (request) {
            console.log('file exist, requests')
            this.callVote({ path: docs[0].path })
          } else {
            console.log('file exist')
          }
        })
      })
    } catch (e) {
      console.log(e)
    }
  }
}

var entityMap = {
  '&': '&',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '/'
}

function escapeHtml (string) {
  return String(string).replace(/[&<>"'/]/g, s => {
    return entityMap[s]
  })
}

let mumbleClient = null
module.exports = function (input, done) {
  if (mumbleClient === null) {
    mumbleClient = new Mumble()
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
  }
  done('Success')
}
