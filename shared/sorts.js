import fastSort from 'fast-sort'

export default {
  'alphabetical': (channels) => {
    return fastSort(channels).asc('name')
  },

  'location': (channels, { origin }) => {
    const distanceBetweenPoints = (p1, p2) => {
      return Math.abs(Math.sqrt((p1['y'] - p2['y']) * (p1['y'] - p2['y']) + (p1['x'] - p2['x']) * (p1['x'] - p2['x'])))
    }

    return channels.sort((a, b) => {
      a.LatLong = {
        x: a.location.geo[1],
        y: a.location.geo[0]
      }

      b.LatLong = {
        x: b.location.geo[1],
        y: b.location.geo[0]
      }

      return distanceBetweenPoints(origin, a.LatLong) - distanceBetweenPoints(origin, b.LatLong)
    })
  }
}
