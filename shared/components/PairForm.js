import { h, Component } from 'preact'
import { FormButton, ModalTitle, ModalPairCode, ModalParagraph, Button } from '../components'
import { connect } from 'unistore/preact'
import { actions } from '../store'
import hat from 'hat'

class PairForm extends Component {
  state = { code: '...' }
  componentDidMount() {
    const { socket } = this.props
    const code = hat(24, 32)
    if (socket) {
      const emit = () => socket.emit('code', code, () => this.setState({ code }))
      if (socket.connected) {
        emit()
      } else {
        socket.on('connect', emit)  
      }
    }
  }

  render(props, state) {
    return (
      <div>
        <ModalTitle>Your Pair Code</ModalTitle>
        <ModalPairCode>{state.code}</ModalPairCode>
        <ModalParagraph>
          To pair with your mumble user, type
          <input readOnly value={`pair ${state.code}`}></input>
          in your mumble client
        </ModalParagraph>
        <Button>Copy Command to Clipboard</Button>
      </div>
    )
  }
}

export default connect('session', actions)(PairForm)
