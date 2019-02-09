import { h } from 'preact'
import { PureComponent } from 'react'

import { Wrapper, Header, Card, HeaderTitle, HeaderLink, Input, Sidebar, Themed } from './components'
import { connect } from 'unistore/preact'
import { actions } from './store'
import Player from './player'
import Router from './router'
import NotFound from './not-found'
import routes from './routes'
import { getSocket } from './api'

class App extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      sidebarVisible: false
    }

    this.toggleSidebar = this.toggleSidebar.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  componentDidMount () {
    window.addEventListener('keydown', this.handleKey)
    this.socket = getSocket()

    this.socket.on('stats', stats => {
      this.props.setPageData({ mumblebotData: stats })
    })

    this.socket.on('addSong', song => {
      this.props.addSong(song)
    })
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKey)
  }

  handleKey (e) {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
      e.preventDefault()
      this.search.getDOMNode().focus()
    }
  }

  toggleSidebar () {
    this.setState({ sidebarVisible: !this.state.sidebarVisible })
  }

  render (props, state) {
    const { status, title } = props.mumblebotData
    const { playing, queue, nowPlaying } = status
    return (
      <Themed darkTheme={props.settings.darkTheme}>
        <Wrapper tabIndex={0} row visible={state.sidebarVisible}>
          <Sidebar>
            <Card>
              <label for='search'>
                <p>Search songs....</p>
              </label>
              <Input id='search' value={props.filter} ref={(input) => { this.search = input }} onInput={props.setFilter} />

              <label for='theme'>
                Use Dark Theme
                <Input id='theme' name='theme' type='checkbox' checked={props.settings.darkTheme} onChange={props.toggleTheme} />
              </label>
            </Card>
            <Card expand>
              {playing && (
                <div>
                  <p><strong>Now Playing</strong></p>
                  <p>{nowPlaying}</p>
                </div>
              )}
              {queue.length > 0 && (
                <div>
                  <p><strong>Queued</strong></p>
                  {queue.map(item => <p>{item.title || item.name}</p>)}
                </div>
              )}
            </Card>
            <Card>
              <Player preview={props.preview || {}} />
            </Card>
          </Sidebar>
          <Wrapper>
            <Header>
              <HeaderLink onClick={this.toggleSidebar} sidebarLink>Sidebar</HeaderLink>
              <HeaderTitle href='/'>
                {title}
              </HeaderTitle>
              <HeaderLink href='/radio'>Radio</HeaderLink>
            </Header>
            <Router preview={Object.keys(props.preview).length > 0} routes={routes} base={props.route} notFound={NotFound} setPageData={props.setPageData} />
          </Wrapper>
        </Wrapper>
      </Themed>
    )
  }
}

export default connect('filter,settings,mumblebotData,preview', actions)(App)
