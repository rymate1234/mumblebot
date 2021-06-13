import fetch from 'isomorphic-unfetch'
import { promisify } from 'util'
import fs from 'fs'

export default async () => {
  let radioJson
  try {
    const res = await fetch('https://radio.rymate.co.uk/api/stations')
    radioJson = await res.json()
  } catch (e) {
    console.log(e)
  }
  if (radioJson)
    await promisify(fs.writeFile)('./stations.json', JSON.stringify(radioJson))
}
