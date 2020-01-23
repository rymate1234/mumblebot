import 'preact/debug'

import App from '../shared/app'
import { ClientStore } from '../shared/store'
import { h, render } from 'preact'
import 'react-virtualized/styles.css'

const mountNode = document.getElementById('app')

const app = (
  <ClientStore>
    <App />
  </ClientStore>
)

render(app, mountNode)
