import { Router } from 'express'
import dbconn from './database'
import { spawn } from 'threads'

import multer from 'multer'
import audioMetaData from 'audio-metadata'
import fs from 'fs'

import schedule from 'node-schedule'
import getStations from './get-stations'
import normaliseSong from '../shared/util/normalise-song'

const config = require('../config.js')

let songsDb = {}
let playlistsDb = {}

dbconn(function (err, data) {
  if (err) {
    console.log(err)
    return
  }

  songsDb = data.collection('songs')
  playlistsDb = data.collection('playlists')
})

const thread = spawn('server/mumble/index.js')
thread.send()

const router = Router()
schedule.scheduleJob('0 * * * *', getStations)
getStations()

router.get('/music', function (req, res, next) {
  let sent = false
  songsDb.find().sort({ date: -1 }).toArray(function (err, docs) {
    if (!sent) {
      if (err) {
        res.json({failed: true, error: err})
      } else {
        res.json(docs)
      }
      sent = true
    }
  })
})

router.get('/playlists', function (req, res, next) {
  let sent = false
  playlistsDb.find().sort({ date: -1 }).toArray(function (err, docs) {
    if (!sent) {
      if (err) {
        res.json({failed: true, error: err})
      } else {
        res.json(docs)
      }
      sent = true
    }
  })
})

router.get('/radio', (req, res) => {
  const stations = fs.createReadStream('stations.json')
  res.type('json')

  stations.pipe(res)
})

router.get('/stats', function (req, res, next) {
  let sent = false
  thread.send({action: 'status'})
    .on('message', (status) => {
      if (!sent) {
        res.json({'title': config.name, 'status': status})
        sent = true
      }
    })
})

router.get('/file/:id', function (req, res) {
  var filepath = req.params.id
  res.set({ 'Content-Type': 'audio/mpeg' })

  var music = 'uploads/' + filepath
  var stat = fs.statSync(music)
  var range = req.headers.range

  var readStream
  if (range !== undefined) {
    var parts = range.replace(/bytes=/, '').split('-')

    var partialStart = parts[0]
    var partialEnd = parts[1]

    var start = parseInt(partialStart, 10)
    var end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1
    var contentLength = (end - start) + 1

    res.status(206).header({
      'Content-Type': 'audio/mpeg',
      'Content-Length': contentLength,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size
    })

    readStream = fs.createReadStream(music, { start: start, end: end })
  } else {
    res.header({
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    })
    readStream = fs.createReadStream(music)
  }

  readStream.pipe(res)
})

router.post('/upload', multer({ dest: './uploads/' }).single('fileInput'), function (req, res, next) {
  var details = req.file
  console.log(details)
  details.date = new Date()

  var data = fs.readFileSync(details.path)
  var metadata = audioMetaData.id3v2(data)
  details.metadata = metadata
  if (details.metadata === {}) {
    details.metadata = null
  }

  songsDb.insert(normaliseSong(details))

  res.redirect('/')
})

router.post('/request', function (req, res, next) {
  if (req.body !== undefined) {
    var body = req.body
    if (body.json) {
      body = JSON.parse(body.json)
    }

    thread.send({ action: 'request', payload: body })
    res.status(200)
    res.send('Success')
  } else {
    console.log(req)
    res.status(500)
    res.send('Failed')
  }
})

router.post('/youtube', function (req, res, next) {
  console.log(req.body)
  var url = req.body.songid ? req.body.songid : req.body.yturl
  thread.send({ action: 'youtube', payload: url })
  res.send('Success')
})

export default router
