import 'source-map-support/register' // map that source!
import './preactPatch'
import 'isomorphic-unfetch'

import express from 'express'
import compression from 'compression'
import { ServerStore } from '../shared/store'
import App from '../shared/app'
import routes from '../shared/routes'
import { getStats } from '../shared/api'
import { h } from 'preact'

import render from 'preact-render-to-string'
import path from 'path'
import { ServerStyleSheet } from 'styled-components'

import api from './api'
import { json, text, urlencoded } from 'body-parser'

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const app = express()

app.use(compression())
app.use(json())
app.use(text())
app.use(urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, '../dist')))
app.use(express.static(path.resolve(__dirname, '../static')))
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, '../views'))
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Import API Routes
app.use('/api', api(io))

const init = async req => {
  const current = routes[req.url]

  let data = { mumblebotData: await getStats() }
  if (current && current.getData) {
    try {
      data = await current.getData()
    } catch (e) {
      console.log(e)
    }
  }
  const store = ServerStore({
    children: <App route={req.url} />,
    data,
    req
  })

  return store
}

// on each request, render and return a component:
app.get('/*', async (req, res, next) => {
  const store = await init(req)
  if (!store) return next()
  const sheet = new ServerStyleSheet()
  const html = render(sheet.collectStyles(store.serverStore))
  const styleTags = sheet.getStyleTags()

  const data = store.data

  if (data.pageData && data.pageData.list) {
    data.pageData.list = data.pageData.list.slice(0, 100)
  }

  const storeData = JSON.stringify(data)

  res.render('index', { html, styleTags, storeData })
})

http.listen(PORT, function() {
  console.log('listening on *:3000');
});