import { h, Component } from 'preact'
import List from './list'
import { Wrapper, Link } from './components'
import YoutubeForm from './components/YoutubeForm'
import UploadForm from './components/UploadForm'

class Songs extends Component {
  constructor () {
    super()
    this.state = {
      form: 'upload'
    }
  }

  render (props, state) {
    return (
      <Wrapper>
        <div>
          <div>
            <Link padding onClick={() => this.setState({ form: 'upload' })}>
              Upload
            </Link>
            <Link padding onClick={() => this.setState({ form: 'youtube' })}>
              YouTube
            </Link>
          </div>
          {state.form === 'upload' && (
            <UploadForm />
          )}
          {state.form === 'youtube' && (
            <YoutubeForm />
          )}
        </div >
        <List {...props} />
      </Wrapper>
    )
  }
}
export default Songs
