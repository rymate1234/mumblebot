import { h, Component } from 'preact'
import List from './list'
import { Wrapper, Input, Link, Label, FormWrap } from './components'
import YoutubeForm from './components/YoutubeForm'

class Songs extends Component {
  constructor () {
    super()
    this.state = {
      form: 'upload',
      selectedFilename: ''
    }
    this.handleFile = this.handleFile.bind(this)
  }

  handleFile (event) {
    this.setState({ selectedFilename: event.target.files[0].name })
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
            <form method='post' action='api/upload' onSubmit={() => { }} enctype='multipart/form-data'>
              <FormWrap>
                <Label>
                  <span>{state.selectedFilename || 'Click to choose file'}</span>
                  <Input name='fileInput' id='fileInput' type='file' onChange={this.handleFile} />
                </Label>
                <Input type='submit' value='Upload' />
              </FormWrap>
            </form>
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
