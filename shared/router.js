import { h, Component } from 'preact'
import Navaid from 'navaid'
import { connect } from 'unistore/preact'
import { actions } from './store'

class Router extends Component {
  constructor (props) {
    super(props)

    this.state = {
      params: {},
      currentComponent: 'div'
    }
  }

  componentWillMount () {
    const base = this.props.base || '/'
    this.router = new Navaid('/', () => {
      this.setState({ currentComponent: this.props.notFound })
    })

    const isClient = typeof window !== 'undefined'

    Object.entries(this.props.routes).forEach(([ route, info ]) => {
      this.router.on(route, async params => {
        if (info.getData && isClient) {
          const data = await info.getData()
          this.props.setPageData(data)
        }
        this.setState({ path: route, params, currentComponent: info.component })
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

export default connect('preview', actions)(Router)
