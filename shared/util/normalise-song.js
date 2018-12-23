export default song => {
  const { filename, originalname, path, date } = song
  let title = ''
  if (song.metadata && song.metadata.title) {
    if (typeof song.metadata.artist === 'string' || song.metadata.artist instanceof String) {
      title = song.metadata.title + ' - ' + song.metadata.artist
    } else if (song.metadata.artist) {
      title = song.metadata.title + ' - ' + song.metadata.artist.name
    }
  } else {
    title = song.originalname
  }

  const source = song.fieldname ? 'upload' : 'youtube'

  return {
    title, filename, originalname, path, date, source
  }
}