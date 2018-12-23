'use strict'
import { join } from 'path'
import { connect as _connect } from 'mumble'
import Queue from './queue'
import { readFileSync, readdir, stat } from 'fs'
import Mixer from 'audio-mixer'
import { contains } from 'underscore'
import dbconn from '../database'
import { server, username, password } from '../../config.js'
import { h } from 'preact'
import render from 'preact-render-to-string'

import ytdl from 'ytdl-core'
import ffmpeg, { ffprobe } from 'fluent-ffmpeg'

let db = {}

dbconn(function (err, data) {
  if (err !== null) {
    return
  }

  db = data.collection('songs')
})

var connected

var options = {
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem')
}

var client

var CURRENT_VOL = 0.125

var playing

var queue = new Queue()
var playingSong = {}

var yesVotes = []
var noVotes = []
var voteHappening = false

var sessions = {}

class Mumble {
  constructor () {
    console.log('Connecting')
    this.currentFile = {}
    this.inputStream = {}

    this.mixer = new Mixer({
      channels: 2,
      sampleRate: 44100
    })
    this.onUpdate = function () {}
  }

  connect () {
    _connect(server, options, (error, connection) => {
      if (error) {
        throw new Error(error)
      }

      console.log('Connected')

      connection.authenticate(username, password)
      client = connection

      connection.on('initialized', () => {
        console.log('Connection initialized')
        client.user.channel.sendMessage('...aaaaaand we\'re back!')
        client.user.channel.sendMessage('Loaded MumbleBot!')
        client.connection.sendMessage('UserState', {
          session: client.user.session,
          actor: client.user.session,
          comment: render(
            <div>
              <h1>Welcome to MumbleBot</h1>
              <p>To request a song, head to <a href='http://rymate.co.uk/mumble/'>http://rymate.co.uk/mumble/</a></p>
            </div>
          )
        })
      })

      this.inputStream = client.inputStream({
        channels: 2,
        sampleRate: 44100,
        gain: CURRENT_VOL
      })
      this.mixer.pipe(this.inputStream)

      // Collect user information
      connection.on('userState', function (state) {
        sessions[state.session] = state
      })

      // On text message...
      connection.on('textMessage', (data) => {
        console.log(data.actor)
        var user = sessions[data.actor]
        console.log(new Date() + ' - ' + user.name + ': ', data.message)
        this.handleMessage(data)
      })

      connected = true
    })
  }

  getStatus () {
    var status = {}
    status.playing = playing
    status.nowPlaying = playingSong.name || playingSong.title
    status.queue = queue.getArray()

    return status
  }

  setComment () {
    var message
    if (playingSong !== '') {
      message = (
        <div>
          <h1>Now Playing:</h1>
          <p>{playingSong.name || playingSong.title}</p>
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

    client.connection.sendMessage('UserState', {
      session: client.user.session,
      actor: client.user.session,
      comment: render(message)
    })
    this.onUpdate()
  }

  voteHappening () {
    return voteHappening
  }

  handleMessage (data) {
    var regex = /(<([^>]+)>)/ig
    var message = data.message.replace(regex, '').split(' ')
    console.log(data.actor)
    switch (message[0].toLowerCase()) {
      case 'voteyes':
      case 'yes':
      case 'y':
        if (contains(yesVotes, data.actor) || contains(noVotes, data.actor)) {
          client.user.channel.sendMessage("You've already voted!")
        } else {
          yesVotes.push(data.actor)
        }
        break
      case 'voteno':
      case 'no':
      case 'n':
        if (contains(noVotes, data.actor) || contains(yesVotes, data.actor)) {
          client.user.channel.sendMessage("You've already voted!")
        } else {
          noVotes.push(data.actor)
        }
        break
      case 'stopsong':
      case 'stop':
        if (voteHappening) {
          return
        }

        const message = render(
          <p>
            Someone has requested to stop the song: {playingSong.name}<br />
            Use voteyes and voteno to vote! 10 Seconds to vote...
          </p>
        )
        client.user.channel.sendMessage()
        this.handleVote(() => this.stopSong())
        break
      case 'volume':
      case 'vol':
        if (this.inputStream == null) {
          client.user.channel.sendMessage('Nothing is playing currently!')
        } else if (message.length > 2) {
          client.user.channel.sendMessage('Invalid Volume Command!')
        } else if (message.length === 1) {
          client.user.channel.sendMessage('Volume is currently ' + CURRENT_VOL * 4)
        } else {
          if (voteHappening) {
            return
          }
          var volume = message[1]

          if (volume > 1 || volume < 0) {
            client.rootChannel.sendMessage('Volume must be between 0 and 1!')
            break
          }

          volume = volume / 4

          client.user.channel.sendMessage('Calling a vote to change volume. <br>Use voteyes and voteno to vote! 10 Seconds to vote...')
          this.handleVote(() => {
            this.inputStream.gain = volume
            CURRENT_VOL = volume
          })
        }
        break
      case 'purge':
        if (voteHappening) {
          return
        }

        client.user.channel.sendMessage('Someone has requested to purge the list of songs <br>Use voteyes and voteno to vote! 10 Seconds to vote...')
        this.handleVote(() => {
          this.stopSong()
          queue = new Queue()
        })
        break
      case 'yt':
      case 'pyt':
      case 'youtube':
      case 'playyoutube':
        var request = message[0].startsWith('p')
        if (message.length < 2) {
          client.user.channel.sendMessage('Invalid ' + message[0] + ' command!')
        } else {
          var filter = /(<([^>]+)>)/ig

          message.shift()
          var result = message.join(' ').replace(filter, '')

          client.user.channel.sendMessage('Adding ' + result)
          this.uploadYoutube(result, request)
        }
        break
      case 'idk':
        db.find().sort({ date: -1 }).toArray((err, docs) => {
          if (err) {
            console.log(err)
            return
          }
          var picked = Math.floor(Math.random() * docs.length) + 1
          var songs = docs[picked]
          var done = { 'songid': songs.filename }
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

    playing = false
    playingSong.name = ''
    playingSong.input.destroy()
    this.setComment()

    this.currentFile.kill()
    this.currentFile = {}

    setTimeout(() => {
      if (queue.getLength() !== 0) this.play(queue.dequeue())
    }, 2000)
  }

  async callVote (filename) {
    if (voteHappening) {
      return
    }
    console.log(filename)
    let request

    if (!filename.radio) {
      request = await new Promise((resolve, reject) => db.find({ path: filename.path }).toArray((err, docs) => {
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

    client.user.channel.sendMessage(render(
      <p>Someone has requested the following {type}: {request.name || request.title} <br />Use voteyes and voteno to vote! 10 Seconds to vote...</p>
    ))
    this.handleVote(() => this.play(request))
  }

  handleVote (callback) {
    if (voteHappening) {
      return
    }

    yesVotes = []
    noVotes = []
    voteHappening = true
    setTimeout(() => {
      if (yesVotes.length > noVotes.length) {
        client.user.channel.sendMessage('Vote success! Yes Votes: ' + yesVotes.length + ' - No Votes: ' + noVotes.length)
        this.onUpdate()
        callback()
      } else if (yesVotes.length < noVotes.length) {
        client.user.channel.sendMessage('Vote failed! Yes Votes: ' + yesVotes.length + ' - No Votes: ' + noVotes.length)
      } else if ((yesVotes.length === 0) && (noVotes.length === 0)) {
        client.user.channel.sendMessage('No-one cared! Passing vote anyway...')
        this.onUpdate()
        callback()
      } else {
        client.user.channel.sendMessage('Vote failed! Yes Votes: ' + yesVotes.length + ' - No Votes: ' + noVotes.length)
      }

      voteHappening = false
    }, 10000)
  }

  play (filename) {
    if (!connected) {
      return
    }

    if (playing) {
      queue.enqueue(filename)
      return
    }

    if (filename.radio) {
      ffprobe(filename.src.replace(';', ''), (err, metadata) => {
        if (err) {
          console.log(err)
          return
        }
        console.dir(metadata.streams)
        this.currentFile = this.getFfmpegInstance(filename.src.replace(';', ''), () => {
          console.log('Finished')
        })

        playingSong.name = filename.name
        this.setPlaying()

        playingSong.input = this.mixer.input({
          channels: 2,
          sampleRate: 44100
        })

        this.currentFile.pipe(playingSong.input, { end: false })
      })
    } else {
      this.currentFile = this.getFfmpegInstance(filename.path, () => {
        playing = false
        if (queue.getLength() !== 0) {
          console.log('ended')
          this.play(queue.dequeue())
        }
      })

      playingSong.input = this.mixer.input({
        channels: 2,
        sampleRate: 44100
      })

      this.currentFile.pipe(playingSong.input, { end: true })
      playingSong.name = filename.name
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
    client.user.channel.sendMessage('Now playing: ' + playingSong.name)
    client.user.channel.sendMessage('To call a vote to stop it, type stopsong in chat.')
    this.setComment()
    playing = true
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

  playMeme () {
    if (this.meme) return

    var memeFile = this.getFfmpegInstance('assets/spicymeme.mp3', () => {
      this.meme = false
    })

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
    if (!url.startsWith('http')) return
    console.log(url)
    try {
      var youtube = ytdl(url, {filter: 'audioonly'})
      youtube.on('info', (info, format) => {
        db.find({path: 'uploads/' + info.video_id}).toArray((err, docs) => {
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

                db.insertOne(details, function (err, docs) {
                  if (!err) {
                    console.log('Finished processing')

                    if (request) this.callVote({songid: info.video_id})
                  }
                })
              })
            save.save('./uploads/' + info.video_id)
          } else if (request) {
            console.log('file exist, requests')
            this.callVote({songid: info.video_id})
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
    if (mumbleClient.voteHappening()) {
      return done()
    }
    console.log(input.payload)
    mumbleClient.callVote(input.payload)
  } else if (input.action === 'youtube') {
    mumbleClient.uploadYoutube(input.payload, false)
  }
  done('Success')
}
