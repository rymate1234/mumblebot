import createStore from 'unistore'
import { Provider } from 'unistore/preact'
import { h } from 'preact'
import devtools from 'unistore/devtools'
import sorts from './sorts'
import persistStore from 'unissist'
import localStorageAdapter from 'unissist/integrations/localStorageAdapter'

const isClient = typeof window !== 'undefined'

// Default values except migration
const defaultState = Object.assign({
  pageData: {},
  mumblebotData: {},
  preview: {},
  settings: {
    darkTheme: true
  }
}, isClient ? window.__backend_data__ : {})

const combineState = state => Object.assign(defaultState, {
  savedStations: state.savedStations || [],
  settings: state.settings
})

const config = {
  version: 1,
  debounceTime: 100,
  hydration: combineState,
  map: combineState
}

const ClientStore = ({ children }) => {
  const store = process.env.NODE_ENV === 'production'
    ? createStore(defaultState)
    : devtools(createStore(defaultState))

  const adapter = localStorageAdapter()

  persistStore(store, adapter, config)

  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

const ServerStore = ({ children, data }) => {
  const store = createStore({ ...defaultState, ...data })

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
    if (item.name.toLowerCase().includes(word)) {
      matched = true
    } else if (item.location.name.toLowerCase().includes(word)) {
      matched = true
    } else if (item.location.country.toLowerCase().includes(word)) {
      matched = true
    } else {
      matched = false
      break
    }
  }

  return matched
}

let actions = store => ({
  setPreview (state, station) {
    return Object.assign(state, { station })
  },

  setPageData (state, data) {
    return { ...state, ...data }
  },

  toggleTheme (state) {
    console.log('toggled it')
    store.setState({
      settings: {
        darkTheme: !state.settings.darkTheme,
        muted: state.settings.muted
      }
    })
  },
  toggleMuted (state) {
    console.log('muted it')
    store.setState({
      settings: {
        darkTheme: state.settings.darkTheme,
        muted: !state.settings.muted
      }
    })
  },
  setSort ({ data, settings, filter }, sort, sortData) {
    store.setState({
      sortedChannels: filterChannels(sorts[sort](data.channels, sortData), filter),
      settings: Object.assign(settings, {
        sort,
        sortData
      })
    })
  },
  setFilter (state, e) {
    const { target: { value } } = e
    const filtered = filterChannels(state.data.channels, value)

    store.setState({
      sortedChannels: filtered,
      filter: value
    })
  }
})

export { actions, ClientStore, ServerStore }
