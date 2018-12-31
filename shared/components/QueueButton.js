import { h, Component } from 'preact'
import { FormButton } from '../components'

export default class QueueButton extends Component {
  async requestSong (e) {
    e.preventDefault()
    // eslint-disable-next-line no-undef
    const req = await fetch('/api/request', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.props.data)
    })
    const content = await req.text()
    console.log(content)
  }

  render (props) {
    return (
      <form method='post' action='/api/request' onSubmit={(e) => this.requestSong(e)}>
        <input type='hidden' name='json' value={JSON.stringify(props.data)} />
        <FormButton primary type='submit'>Queue</FormButton>
      </form>
    )
  }
}
