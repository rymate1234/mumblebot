import { h, Component } from 'preact'
import fetch from 'isomorphic-unfetch'
import { FormWrap, Input } from '../components'

export default class YoutubeForm extends Component {
  async addYoutube (e) {
    e.preventDefault()
    this.setState({ state: 'Loading...' })
    const req = await fetch('/api/youtube', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
    const content = await req.text()
    this.setState({ state: content })
  }

  render (props, { state }) {
    return (
      <form
        method='post'
        action='api/youtube'
        onSubmit={e => this.addYoutube(e)}
      >
        <FormWrap>
          <Input
            name='song'
            onChange={e => this.setState({ song: e.target.value })}
            id='yturl'
            type='url' disabled={state === 'Loading...'}
            placeholder='Paste a youtube URL'
          />
          <Input type='submit' value={state || 'Add'} />
        </FormWrap>
      </form>
    )
  }
}
