import socketIOClient from 'socket.io-client'
import fetch from 'isomorphic-unfetch'

const isClient = typeof window !== 'undefined'
const port = process.env.PORT || 3000
const prefix = isClient ? '' : 'http://127.0.0.1:' + port

export const getSocket = () => {
  return socketIOClient()
}

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
const format = (date) =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

export const mapSong = (song) => ({
  ...song,
  src: '/api/file/' + song.filename,
  info: `Uploaded on ${format(new Date(song.date))}`,
})

export const getSongs = async () => {
  try {
    const songsReq = await fetch(prefix + '/api/music')
    const songs = await songsReq.json()
    const stats = await getStats()

    const list = songs.map(mapSong)

    return {
      pageData: { list },
      mumblebotData: stats,
    }
  } catch (e) {
    console.log('Failed making request')
    console.log(e)
    return { error: true, e }
  }
}

export const getStations = async () => {
  try {
    const stationsReq = await fetch(prefix + '/api/radio')
    const { stations } = await stationsReq.json()
    const stats = await getStats()

    const channels = stations.map(station => {
      station.info = `${station.location.name}, ${station.location.country}`

      return station
    })

    let list = channels.map((channel) => ({
      ...channel,
      title: channel.name,
      radio: true,
    }))

    list = list.sort((a, b) =>
      a.title !== b.title ? (a.title < b.title ? -1 : 1) : 0
    )

    return {
      pageData: { list },
      mumblebotData: stats,
    }
  } catch (e) {
    console.log('Failed making request')
    console.log(e)
    return { error: true, e }
  }
}
