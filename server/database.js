var Mongo = require('mongodb').MongoClient

const url = 'mongodb://localhost:27017/mumblebot'

function Connect (callback) {
  Mongo.connect(url, function (err, db) {
    const database = db.db('mumblebot')
    callback(err, database)
  })
}

module.exports = Connect
