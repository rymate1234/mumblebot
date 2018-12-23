import './preactPatch'

import express from 'express'
import compression from 'compression'
import { ServerStore } from '../shared/store'
import App from '../shared/app'
import routes from '../shared/routes'
import { h } from 'preact'

import render from 'preact-render-to-string'
import path from 'path'
import { ServerStyleSheet } from 'styled-components'

import memoize from 'promise-memoize'
import api from './api'

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const app = express()

app.use(compression())
app.use(express.static(path.resolve(__dirname, '../dist')))
app.use(express.static(path.resolve(__dirname, '../static')))
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, '../views'))

// Import API Routes
app.use('/api', api)

const init = async route => {
  const current = routes[route]
  if (!current || !current.getData) return

  let data = {}
  try {
    data = await current.getData()
  } catch (e) {
    console.log(e)
  }
  const store = ServerStore({
    children: <App route={route} />,
    data
  })

  return store
}

// on each request, render and return a component:
app.get('/*', async (req, res, next) => {
  const store = await init(req.url)
  if (!store) return next()
  const sheet = new ServerStyleSheet()
  const html = render(sheet.collectStyles(store.serverStore))
  const styleTags = sheet.getStyleTags()

  const storeData = JSON.stringify(store.data)

  res.render('index', { html, styleTags, storeData })
})

app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
