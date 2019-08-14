import { h, Component } from 'preact'

import Navaid from 'navaid'
import { Container, Center } from './styles'
const isClient = typeof window !== 'undefined'

class Router extends Component {
  state = {
    params: {},
    loadedInitial: false,
    currentComponent: 'div'
  }

  constructor (props) {
    super(props)

    const base = this.props.base || '/'

    const route = props.routes[base]

    if (!isClient) {
      this.state.currentComponent = route.component
      this.state.path = base
    }
  }

  componentWillMount () {
    this.router = new Navaid('/', () => {
      this.setState({ currentComponent: this.props.notFound, loadedInitial: true })
    })

    if (isClient) {
      Object.entries(this.props.routes).forEach(([route, info]) => {
        this.router.on(route, async params => {
          if (this.state.path === route) {
            return
          }

          const state = { path: route, params, currentComponent: info.component }

          if (!this.state.loadedInitial) {
            this.setState(state)
          }

          if (info.getData && isClient) {
            this.setState({ loading: this.state.loadedInitial })
            const data = await info.getData()
            this.props.setPageData({ ...data, router: { path: route, name: info.name } })
            this.setState({ ...state, loadedInitial: true, loading: false })
          }
        })
      })

      this.router.listen()
    }
  }

  render (props, state) {
    const Current = state.currentComponent
    return (
      <Container preview={props.preview}>
        {state.loading &&
          <Center>
            <img src='https://images.rymate.co.uk/images/3SddFB8.gif' />
          </Center>
        }
        <Current params={state.params} path={state.path} router={this.router} />
      </Container>
    )
  }
}

export default Router
