import { h, Component } from 'preact'
import { Link } from '../components'
import YoutubeForm from './YoutubeForm'
import UploadForm from './UploadForm'

export default class Forms extends Component {
  state = {
    form: 'upload'
  }
  render(props, state) {
    return (
      <div>
        <div>
          <Link padding selected={state.form === 'upload'} onClick={() => this.setState({ form: 'upload' })}>
            Upload
            </Link>
          <Link padding selected={state.form === 'youtube'} onClick={() => this.setState({ form: 'youtube' })}>
            YouTube
          </Link>
        </div>
        {state.form === 'upload' && (
          <UploadForm />
        )}
        {state.form === 'youtube' && (
          <YoutubeForm />
        )}
      </div>
    )
  }
}