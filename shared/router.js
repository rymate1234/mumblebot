import { h } from 'preact'
import { PureComponent } from 'react'

import Navaid from 'navaid'
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
          this.setState({ ...state, loadedInitial: true })
        }

        if (info.getData && isClient) {
          const data = await info.getData()
          this.props.setPageData(data)
          this.setState(state)
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
      <Current params={state.params} path={state.path} router={this.router} />
    )
  }
}

export default Router
