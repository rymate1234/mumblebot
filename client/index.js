import fetch from 'isomorphic-unfetch'

import App from '../shared/app'
import { ClientStore } from '../shared/store'
import { h, render } from 'preact'

import 'preact/debug'

// this is garbage
window.fetch = fetch.bind(window)

const mountNode = document.getElementById('app')

const app = (
  <ClientStore>
    <App />
  </ClientStore>
)
render(app, mountNode, mountNode.lastChild)
