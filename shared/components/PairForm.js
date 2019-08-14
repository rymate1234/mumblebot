import { h, Component } from 'preact'
import { ModalTitle, ModalPairCode, ModalParagraph, Button } from '../components'
import { connect } from 'unistore/preact'
import { actions } from '../store'
import hat from 'hat'

class PairForm extends Component {
  state = {
    code: '...',
    pairing: false,
    paired: false
  }
  componentDidMount () {
    const { socket } = this.props
    const code = hat(30, 36)
    if (socket) {
      const emit = () => socket.emit('code', code, () => this.setState({ code }))
      if (socket.connected) {
        emit()
      } else {
        socket.on('connect', emit)
      }

      socket.on('didPair', () => {
        this.setState({ pairing: true })
      })
    }
  }

  componentWillUnmount () {
    const { socket } = this.props
    socket.off('didPair')
  }

  render (props, state) {
    if (!state.pairing && !state.paired) {
      return (
        <div>
          <ModalTitle>Your Pair Code</ModalTitle>
          <ModalPairCode>{state.code}</ModalPairCode>
          <ModalParagraph>
            To pair with your mumble user, type
            <input readOnly value={`pair ${state.code}`} />
            in your mumble client
          </ModalParagraph>
          <Button>Copy Command to Clipboard</Button>
        </div>
      )
    } else if (state.pairing) {
      return (
        <div>
          <ModalTitle>Pairing with browser...</ModalTitle>
          <ModalParagraph>
            <img src='https://images.rymate.co.uk/images/3SddFB8.gif' />
          </ModalParagraph>
        </div>
      )
    }
  }
}

export default connect('session', actions)(PairForm)
