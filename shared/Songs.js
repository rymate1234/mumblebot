import { h, Component } from 'preact'
import List from './list'
import { Wrapper, Input, Form, Link, Label } from './components'

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
            <Form method='post' action='api/upload' onSubmit={() => { }} enctype='multipart/form-data'>
              <Label>
                <span>{state.selectedFilename || 'Click to choose file'}</span>
                <Input name='fileInput' id='fileInput' type='file' onChange={this.handleFile} />
              </Label>
              <Input type='submit' value='Upload' />
            </Form>
          )}
          {state.form === 'youtube' && (
            <Form method='post' action='api/youtube' onSubmit={() => { }}>
              <Input name='song' id='yturl' type='url' placeholder='Paste a youtube URL' />
              <Input type='submit' value='Upload' />
            </Form>
          )}
        </div >
        <List />
      </Wrapper>
    )
  }
}
export default Songs
