import { MongoClient as Mongo } from 'mongodb'

import config from '../config'
export const url = config.database

const connect = async () => {
  const client = await Mongo.connect(url, {})
  const database = client.db('mumblebot')

  return database
}

export default connect
