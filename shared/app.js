import { h } from 'preact'
import { PureComponent } from 'react'

import {
  Wrapper,
  Header,
  Card,
  HeaderTitle,
  HeaderLink,
  Input,
  Sidebar,
  Themed,
  Button,
  Grid
} from './components'
import { connect } from 'unistore/preact'
import { actions } from './store'
import Player from './player'
import Router from './router'
import NotFound from './not-found'
import routes from './routes'
import { getSocket } from './api'

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sidebarVisible: false,
    }

    this.toggleSidebar = this.toggleSidebar.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKey)
    this.socket = getSocket()

    this.socket.on('stats', (stats) => {
      this.props.setPageData({
        mumblebotData: stats,
        queueButtonsActive: !stats.status.voteHappening,
      })
    })

    this.socket.on('addSong', (song) => {
      this.props.addSong(song)
    })
  }

  componentWillUnmount() {
    this.socket.off()
    window.removeEventListener('keydown', this.handleKey)
  }

  handleKey(e) {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
      e.preventDefault()
      this.search.getDOMNode().focus()
    }
  }

  toggleSidebar() {
    this.setState({ sidebarVisible: !this.state.sidebarVisible })
  }

  async stopSong (e) {
    e.preventDefault()

    const req = await fetch('/api/stop', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: ''
    })
    const content = await req.text()
    console.log(content)
  }

  async removeSong (e, index){
    e.preventDefault()

    const req = await fetch('/api/removesong/' + index, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: ''
    })

    const content = await req.text()
    console.log(content)
  }

  render(props, state) {
    const { status = {}, title } = props.mumblebotData
    const { playing = false, queue = [], nowPlaying = '' } = status
    return (
      <Themed darkTheme={props.settings.darkTheme}>
        <Wrapper tabIndex={0} row visible={state.sidebarVisible}>
          <Sidebar>
            <Card>
              <label for="search">
                <p>Search songs....</p>
              </label>
              <Input
                id="search"
                value={props.filter}
                ref={(input) => {
                  this.search = input
                }}
                onInput={props.setFilter}
              />

              <label for="theme">
                Use Dark Theme
                <Input
                  id="theme"
                  name="theme"
                  type="checkbox"
                  checked={props.settings.darkTheme}
                  onChange={props.toggleTheme}
                />
              </label>
            </Card>
            <Card expand>
              {playing && (
                <div>
                  <p>
                    <strong>Now Playing</strong>
                  </p>
                  <p>{nowPlaying}</p>
                  <Button primary onClick={(e) => this.stopSong(e)}>Stop Song</Button>
                </div>
              )}
              {queue && queue.length > 0 && (
                <div>
                  <p>
                    <strong>Queue</strong>
                  </p>
                  {queue.map((item, index) => (
                    <Grid rows={'auto'} columns={'2fr 60px'} gap="2px" center>
                      <div>
                        <p> {item.title || item.name}</p> 
                      </div>
                      <div>
                        <Button icon danger onClick={(e) => this.removeSong(e, index)}>
                            X
                        </Button>
                      </div>
                    </Grid>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <Player preview={props.preview || {}} />
            </Card>
          </Sidebar>
          <Wrapper>
            <Header>
              <HeaderLink onClick={this.toggleSidebar} sidebarLink>
                Sidebar
              </HeaderLink>
              <HeaderTitle href="/">{title}</HeaderTitle>
              <HeaderLink href="/radio">Radio</HeaderLink>
            </Header>
            <Router
              preview={Object.keys(props.preview).length > 0}
              routes={routes}
              base={props.route}
              notFound={NotFound}
              setPageData={props.setPageData}
            />
          </Wrapper>
        </Wrapper>
      </Themed>
    )
  }
}

export default connect('filter,settings,mumblebotData,preview', actions)(App)
