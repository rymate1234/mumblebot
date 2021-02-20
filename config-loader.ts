import { load, dump } from 'js-yaml'
import example from './config.example'
import { existsSync, readFileSync, writeFileSync } from 'fs'

type Config = typeof example

let config: Config = null

try {
  config = require('./config')
} catch (e) {}

const yml = './data/config.yml'

if (existsSync(yml)) {
  config = load(readFileSync(yml).toString())
} else if (config) {
  writeFileSync(yml, dump(config))
} else {
  writeFileSync(yml, dump(example))

  console.log('Please configure ./data/config.yml')

  process.exit(0)
}

export default config
