import { h, Component } from 'preact'
import { FormButton } from '../styles'
import { connect } from 'unistore/preact'
import { actions } from '../store'

class QueueButton extends Component {
  async requestSong (e) {
    e.preventDefault()
    this.props.setQueueActive(false)
    // eslint-disable-next-line no-undef
    const req = await fetch('/api/request', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.props.data)
    })
    const content = await req.text()
    console.log(content)
    setTimeout(() => this.props.setQueueActive(true), 10000)
  }

  render (props) {
    return (
      <form method='post' action='/api/request' onSubmit={(e) => this.requestSong(e)}>
        <input type='hidden' name='json' value={JSON.stringify(props.data)} />
        <FormButton primary type='submit' disabled={!this.props.queueButtonsActive}>Queue</FormButton>
      </form>
    )
  }
}

export default connect('queueButtonsActive', actions)(QueueButton)
