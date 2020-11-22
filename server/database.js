import assert from 'assert'

import { MongoClient as Mongo } from 'mongodb'
import config from '../config-loader'

const url = config.database || process.env.MONGO_URL

const connect = callback => {
  Mongo.connect(url, (err, db) => {
    assert.ifError(err)
    const database = db.db('mumblebot')
    callback(err, database)
  })
}

export default connect
