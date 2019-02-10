import { MongoClient as Mongo } from 'mongodb'

export const url = 'mongodb://localhost:27017/mumblebot'

const connect = async () => {
  const client = await Mongo.connect(url)
  const database = client.db('mumblebot')

  return database
}

export default connect
