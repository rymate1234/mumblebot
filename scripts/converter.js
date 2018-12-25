const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017'

if (process.argv.length < 4) {
  process.exit(1)
}

// Database Name
const dbName = 'mumblebot'

const oldCollection = process.argv[2]
const newCollection = process.argv[3]

// Create a new MongoClient
const client = new MongoClient(url)

const processDb = async db => new Promise((resolve, reject) => {
  const oldSongs = db.collection(oldCollection)
  const newSongs = db.collection(newCollection)

  const processSong = async song => {
    const { filename, originalname, path, date } = song
    let title = ''
    if (song.metadata && song.metadata.title) {
      if (typeof song.metadata.artist === 'string' || song.metadata.artist instanceof String) {
        title = song.metadata.title + ' - ' + song.metadata.artist
      } else if (song.metadata.artist) {
        title = song.metadata.title + ' - ' + song.metadata.artist.name
      }
    } else {
      title = song.originalname
    }

    title = title || song.originalname

    const source = song.fieldname ? 'upload' : 'youtube'

    const newFormat = {
      title, filename, originalname, path, date, source
    }
    await newSongs.insertOne(newFormat)
  }

  oldSongs.find({}).forEach(processSong, err => {
    if (err) reject(err)
    resolve()
  })
})

// Use connect method to connect to the Server
client.connect(async err => {
  assert.ifError(err)
  console.log('Connected successfully to server')

  const db = client.db(dbName)
  await processDb(db)
  client.close()
})
