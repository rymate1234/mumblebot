import list from './list'
import about from './about'
import fetch from 'isomorphic-fetch'

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
    const list = await songsReq.json()
    const stats = await getStats()

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
    component: list,
    getData: getSongs
  },
  '/radio': {
    name: 'Radio',
    component: list
  },
  '/about': {
    name: 'About',
    component: about
  }
}
