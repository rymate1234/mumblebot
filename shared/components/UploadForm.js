import { h, Component } from 'preact'
import { FormWrap, Input, Label } from '../components'

export default class UploadForm extends Component {
  constructor() {
    super()

    this.handleFile = this.handleFile.bind(this)
    this.uploadSong = this.uploadSong.bind(this)
  }

  async uploadSong(e) {
    e.preventDefault()
    this.setState({ state: 'Loading...' })

    // eslint-disable-next-line no-undef
    const formData = new FormData()
    formData.append('fileInput', this.state.file)

    // eslint-disable-next-line no-undef
    const req = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    this.setState({ state: req.ok ? 'Success' : 'Failed' })
  }

  handleFile(event) {
    this.setState({
      selectedFilename: event.target.files[0].filename,
      file: event.target.files[0],
    })
  }

  render(props, { state, selectedFilename }) {
    return (
      <form
        method="post"
        action="api/upload"
        onSubmit={this.uploadSong}
        enctype="multipart/form-data"
      >
        <FormWrap>
          <Label>
            <span>{selectedFilename || 'Click to choose file'}</span>
            <Input
              name="fileInput"
              id="fileInput"
              type="file"
              onChange={this.handleFile}
            />
          </Label>
          <Input type="submit" value={state || 'Add'} />
        </FormWrap>
      </form>
    )
  }
}
