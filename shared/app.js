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

  handleKeys (ev) {
    document.getElementById('search').focus()
  }

  render (props, state) {
    return (
      <Themed muted={props.settings.muted} darkTheme={props.settings.darkTheme}>
        <Wrapper tabIndex={0} onKeyDown={() => this.handleKeys()} row visible={state.sidebarVisible}>
          <Sidebar>
            <Card>
              <p>Search songs....</p>
              <Input id='search' value={props.filter} ref={(input) => { this.search = input }} onInput={props.setFilter} />

              <label for='theme'>
                Use Dark Theme
                <Input id='theme' name='theme' type='checkbox' checked={props.settings.darkTheme} onChange={props.toggleTheme} />
              </label>

              {props.settings.darkTheme && (
                <label for='muted'>
                  Muted Colours <Input id='muted' name='muted' type='checkbox' checked={props.settings.muted} onChange={props.toggleMuted} />
                </label>
              )}
            </Card>
            <Card expand>
              <p>Playing</p>
            </Card>
            <Card>
              <Player station={props.station || {}} />
            </Card>
          </Sidebar>
          <Wrapper>
            <Header>
              <HeaderLink onClick={this.toggleSidebar} sidebarLink>Sidebar</HeaderLink>
              <HeaderTitle href='/'>
                <span>MumbleBot</span>
                <small></small>
              </HeaderTitle>
              <HeaderLink href='/about'>About</HeaderLink>
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

export default connect('station,data,settings,savedStations,filter', actions)(App)
