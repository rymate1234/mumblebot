import { h } from 'preact'
import { PureComponent } from 'react'

// this saddens me
import Navaid from 'navaid/dist/navaid.umd'
import { Container, Center } from './components'
import { withTheme } from 'styled-components'

class Router extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      params: {},
      loadedInitial: false,
      currentComponent: 'div'
    }
  }

  componentWillMount () {
    const base = this.props.base || '/'
    this.router = new Navaid('/', () => {
      this.setState({ currentComponent: this.props.notFound, loadedInitial: true })
    })

    const isClient = typeof window !== 'undefined'

    Object.entries(this.props.routes).forEach(([ route, info ]) => {
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
          this.props.setPageData(data)
          this.setState({ ...state, loadedInitial: true })
          this.setState({ loading: false })
        }
      })
    })

    if (isClient) {
      this.router.listen()
    } else {
      this.router.run(base)
    }
  }

  render (props, state) {
    let Current = state.currentComponent
    return (
      <Container>
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

export default withTheme(Router)
