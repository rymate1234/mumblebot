import list from './list'
import fetch from 'isomorphic-fetch'
import Songs from './Songs'
import fecha from 'fecha'

const isClient = typeof window !== 'undefined'
const prefix = isClient ? '' : 'http://127.0.0.1:3000'

const getStats = async () => {
  try {
    const stats = await fetch(prefix + '/api/stats')
    const data = await stats.json()

    return data
  } catch (e) {
    console.log(e)
  }
  return {}
}

const getSongs = async () => {
  try {
    const songsReq = await fetch(prefix + '/api/music')
    const songs = await songsReq.json()
    const stats = await getStats()

    const list = songs.map(song => ({
      ...song,
      info: `Uploaded on ${fecha.format(new Date(song.date), 'YYYY-MM-DD HH:mm:ss')}`
    }))

    return {
      pageData: { list },
      mumblebotData: stats
    }
  } catch (e) {
    console.log('Failed making request')
    console.log(e)
    return { error: true, e }
  }
}

export default {
  '/': {
    name: 'Home',
    component: Songs,
    getData: getSongs
  },
  '/radio': {
    name: 'Radio',
    component: list
  }
}
