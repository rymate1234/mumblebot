import { Router } from 'express'
import dbconn from './database'
import { spawn, Worker } from 'threads'

import multer from 'multer'
import { parseBuffer } from 'music-metadata'
import fs from 'fs'

import schedule from 'node-schedule'
import getStations from './get-stations'
import normaliseSong from '../shared/util/normalise-song'

import config from '../config-loader'

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

export default (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected')
  })

  let thread = null

  spawn(new Worker(`./mumble/mumble.js`)).then((t) => {
    thread = t

    thread.initialise().subscribe(async (info) => {
      if (info.type === 'update-stats') {
        const status = await thread.status()
        io.emit('stats', { title: config.name, status })
      } else if (info.type === 'add-song') {
        io.emit('addSong', info.song)
      }
    })
  })

  const router = Router()
  schedule.scheduleJob('0 * * * *', getStations)
  getStations()

  router.get('/music', function (req, res, next) {
    let sent = false
    songsDb
      .find()
      .sort({ date: -1 })
      .toArray(function (err, docs) {
        if (!sent) {
          if (err) {
            res.json({ failed: true, error: err })
          } else {
            res.json(docs)
          }
          sent = true
        }
      })
  })

  router.get('/playlists', function (req, res, next) {
    let sent = false
    playlistsDb
      .find()
      .sort({ date: -1 })
      .toArray(function (err, docs) {
        if (!sent) {
          if (err) {
            res.json({ failed: true, error: err })
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

  router.get('/stats', async function (req, res, next) {
    const status = await thread.status()
    res.json({ title: config.name, status: status })
  })

  router.get('/file/:id', function (req, res) {
    const filepath = req.params.id
    res.set({ 'Content-Type': 'audio/mpeg' })

    const music = 'data/uploads/' + filepath
    const stat = fs.statSync(music)
    const range = req.headers.range

    let readStream
    if (range !== undefined) {
      const parts = range.replace(/bytes=/, '').split('-')

      const partialStart = parts[0]
      const partialEnd = parts[1]

      const start = parseInt(partialStart, 10)
      const end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1
      const contentLength = end - start + 1

      res.status(206).header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': contentLength,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
      })

      readStream = fs.createReadStream(music, { start: start, end: end })
    } else {
      res.header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size,
      })
      readStream = fs.createReadStream(music)
    }

    readStream.pipe(res)
  })

  router.post(
    '/upload',
    multer({ dest: './data/uploads/' }).single('fileInput'),
    async (req, res, next) => {
      const details = req.file
      details.date = new Date()

      const data = fs.readFileSync(details.path)
      const metadata = await parseBuffer(data)
      details.metadata = metadata.common
      if (details.metadata === {}) {
        details.metadata = null
      }

      songsDb.insert(normaliseSong(details), (err, result) => {
        if (err) {
          console.log(err)
          return res.status(500).send(err)
        }
        io.emit('addSong', result.ops[0])
      })

      res.status(200).redirect('/')
    }
  )

  router.post('/request', function (req, res, next) {
    if (req.body !== undefined) {
      let body = req.body
      if (body.json) {
        body = JSON.parse(body.json)
      }

      thread.request(body)
      res.status(200)
      res.send('Success')
    } else {
      console.log(req)
      res.status(500)
      res.send('Failed')
    }
  })

  router.post('/youtube', function (req, res, next) {
    const url = req.body.song ? req.body.song : req.body.yturl
    thread.youtube(url)
    res.send('Success')
  })

  return router
}
