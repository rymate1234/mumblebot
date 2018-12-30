import 'regenerator-runtime/runtime'

import App from '../shared/app'
import { ClientStore } from '../shared/store'
import { h, render } from 'preact'

import 'preact/debug'

const mountNode = document.getElementById('app')

const app = (
  <ClientStore>
    <App />
  </ClientStore>
)
render(app, mountNode, mountNode.lastChild)
