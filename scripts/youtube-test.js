const fetch = require('isomorphic-unfetch')

if (process.argv.length < 4) {
  process.exit(1)
}

const test = process.argv[2]
const urls = [ process.argv[3], process.argv[4] ]

Promise.all(urls.map(async element => {
  const req = await fetch(element + 'api/youtube', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ song: test })
  })
  return req.text()
})).then(i => console.log(i)).catch(console.log)
