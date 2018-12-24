import { h, Component } from 'preact'
import { Wrapper, Header, Container, Card, HeaderTitle, HeaderLink, Input, Sidebar, Themed } from './components'
import { connect } from 'unistore/preact'
import { actions } from './store'
import Player from './player'
import Router from './router'
import NotFound from './not-found'
import routes from './routes'

class App extends Component {
  constructor () {
    super()
    this.state = {
      sidebarVisible: false
    }

    this.toggleSidebar = this.toggleSidebar.bind(this)
  }

  toggleSidebar () {
    this.setState({ sidebarVisible: !this.state.sidebarVisible })
  }

  render (props, state) {
    const { playing, queue, nowPlaying } = props.mumblebotData.status
    return (
      <Themed muted={props.settings.muted} darkTheme={props.settings.darkTheme}>
        <Wrapper tabIndex={0} row visible={state.sidebarVisible}>
          <Sidebar>
            <Card>
              <p>Search songs....</p>
              <Input id='search' value={props.filter} ref={(input) => { this.search = input }} onInput={props.setFilter} />

              <label for='theme'>
                Use Dark Theme
                <Input id='theme' name='theme' type='checkbox' checked={props.settings.darkTheme} onChange={props.toggleTheme} />
              </label>
            </Card>
            <Card expand>
              {playing && (
                <div>
                  <p><strong>Now Playing:</strong></p>
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
              <Player station={props.preview || {}} />
            </Card>
          </Sidebar>
          <Wrapper>
            <Header>
              <HeaderLink onClick={this.toggleSidebar} sidebarLink>Sidebar</HeaderLink>
              <HeaderTitle href='/'>
                MumbleBot
              </HeaderTitle>
              <HeaderLink href='/radio'>Radio</HeaderLink>
            </Header>
            <Container>
              <Router routes={routes} base={props.route} notFound={NotFound} />
            </Container>
          </Wrapper>
        </Wrapper>
      </Themed>
    )
  }
}

export default connect('preview,pageData,settings,mumblebotData', actions)(App)
