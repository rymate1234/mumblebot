import { h, Component } from 'preact'
import fetch from 'isomorphic-fetch'
import { Button as LinkButton } from '../components'

const Button = LinkButton.withComponent('button')

export default class QueueButton extends Component {
  async requestSong (e) {
    e.preventDefault()
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
        <input type='hidden' name='json' id='json' value={JSON.stringify(props.data)} />
        <Button type='submit'>Queue</Button>
      </form>
    )
  }
}
