import assert from 'assert'

import { MongoClient as Mongo } from 'mongodb'

const url = 'mongodb://localhost:27017/mumblebot'

const connect = callback => {
  Mongo.connect(url, (err, db) => {
    assert.ifError(err)
    const database = db.db('mumblebot')
    callback(err, database)
  })
}

export default connect
