import socketIOClient from 'socket.io-client'

const isClient = typeof window !== 'undefined'
const port = process.env.PORT || 3000
const fetch = window.fetch
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
const format = date => date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

export const mapSong = song => ({
  ...song,
  src: '/api/file/' + song.filename,
  info: `Uploaded on ${format(new Date(song.date))}`
})

export const getSongs = async () => {
  try {
    const songsReq = await fetch(prefix + '/api/music')
    const songs = await songsReq.json()
    const stats = await getStats()

    const list = songs.map(mapSong)

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

export const getStations = async () => {
  try {
    const stationsReq = await fetch(prefix + '/api/radio')
    const data = await stationsReq.json()
    const stats = await getStats()

    const channels = []
    data.places.forEach(element => {
      element.channels.forEach(channelIndex => {
        const channel = data.channels[channelIndex]
        const location = element
        const country = data.countries[element.countryIndex]
        channel.info = `${location.name}, ${country}`
        channels.push(channel)
      })
    })

    let list = channels.map(channel => ({
      ...channel,
      title: channel.name,
      radio: true
    }))

    list = list.sort((a, b) => a.title !== b.title ? a.title < b.title ? -1 : 1 : 0)

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
