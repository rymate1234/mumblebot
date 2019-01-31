import createStore from 'unistore'
import { Provider } from 'unistore/preact'
import { h } from 'preact'
import devtools from 'unistore/devtools'
import Cookies from 'universal-cookie'
import { mapSong } from './api'

const isClient = typeof window !== 'undefined'

// Default values except migration
const defaultState = Object.assign({
  pageData: {},
  mumblebotData: {},
  preview: {},
  filtered: [],
  settings: {
    darkTheme: true
  },
  updates: 0
}, isClient ? window.__backend_data__ : {})

let cookies = {}

const dataToReset = {
  filter: '',
  filtered: []
}

const getSettings = () => {
  let settings = cookies.get('settings')
  if (!settings) {
    settings = defaultState.settings
    cookies.set('settings', settings)
  }
  return settings
}

const ClientStore = ({ children }) => {
  cookies = new Cookies()

  const settings = getSettings()
  const state = { ...defaultState, settings }

  const store = process.env.NODE_ENV === 'production'
    ? createStore(state)
    : devtools(createStore(state))

  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

const ServerStore = ({ children, data, req }) => {
  cookies = new Cookies(req.headers.cookie)

  const settings = getSettings()
  const store = createStore({ ...defaultState, ...data, settings })

  const serverStore = (
    <Provider store={store}>
      {children}
    </Provider>
  )
  return { data: store.getState(), serverStore }
}

const filterChannels = (channels, filter) => channels.filter(item => !filter || filterItem(item, filter.toLowerCase()))

const filterItem = (item, filter) => {
  let matched = false
  for (const word of filter.split(' ')) {
    if (item.title.toLowerCase().includes(word)) {
      matched = true
    } else if (item.info.toLowerCase().includes(word)) {
      matched = true
    } else {
      matched = false
      break
    }
  }

  return matched
}

let actions = store => ({
  setPreview (state, { e, item }) {
    if (e) e.preventDefault()
    return Object.assign(state, { preview: item })
  },

  setPageData (state, data) {
    state.updates++
    return { ...state, ...data, ...dataToReset }
  },

  addSong (state, data) {
    if (state.router.name === 'Stations') return 
    state.pageData.list.unshift(mapSong(data))
    state.updates++
    const filtered = filterChannels(state.pageData.list, state.filter)

    return Object.assign(state, { filtered })
  },

  toggleTheme (state) {
    const settings = {
      darkTheme: !state.settings.darkTheme
    }
    cookies.set('settings', settings)
    console.log('toggled it')
    store.setState({ settings })
  },

  setFilter (state, e) {
    const { target: { value } } = e
    const filtered = filterChannels(state.pageData.list, value)

    store.setState({
      filtered: (value && filtered.length) ? filtered : [],
      filter: value
    })
  }
})

export { actions, ClientStore, ServerStore }
