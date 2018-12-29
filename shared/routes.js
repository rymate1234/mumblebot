import list from './list'
import fetch from 'isomorphic-fetch'
import Songs from './Songs'
import fecha from 'fecha'
import fastSort from 'fast-sort'

const isClient = typeof window !== 'undefined'
const port = process.env.PORT || 3000

const prefix = isClient ? '' : 'http://127.0.0.1:' + port

export const getStats = async () => {
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
      src: '/api/file/' + song.filename,
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

const getStations = async () => {
  try {
    const stationsReq = await fetch(prefix + '/api/radio')
    const data = await stationsReq.json()
    const stats = await getStats()

    const channels = []
    data.places.forEach(element => {
      element.channels.forEach(channelIndex => {
        const channel = data.channels[channelIndex]
        channel.location = element
        channel.location.country = data.countries[element.countryIndex]
        channels.push(channel)
      })
    })

    let list = channels.map(channel => ({
      ...channel,
      title: channel.name,
      radio: true,
      info: `${channel.location.name}, ${channel.location.country}`
    }))

    list = fastSort(list).asc('name')

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
  '/all': {
    name: 'Home',
    component: Songs,
    getData: getSongs
  },
  '/radio': {
    name: 'Radio',
    component: list,
    getData: getStations
  },
  '/radio/all': {
    name: 'Radio',
    component: list,
    getData: getStations
  }
}
