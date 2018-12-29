/* global Windows */
import { h, Component } from 'preact'
import { Button } from './components'
import { Grid, Cell } from 'styled-css-grid'
import linkState from 'linkstate'

class Player extends Component {
  constructor (props) {
    super(props)

    this.state = {
      volume: 100,
      playing: false
    }
  }

  componentDidMount () {
    if (this.audio) {
      this.audio.addEventListener('stalled', function (e) {
        console.log('stalled')
        this.audio.load()
      })
      console.log(this.audio)
    }

    if (typeof Windows !== 'undefined') {
      this.systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView()

      this.systemMediaControls.isPlayEnabled = true
      this.systemMediaControls.isPauseEnabled = true
      this.systemMediaControls.isStopEnabled = true
      this.systemMediaControls.addEventListener('buttonpressed', (e) => this.togglePlay(e))
      this.systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.closed
    }
  }

  togglePlay (args) {
    if ((args && args.button === Windows.Media.SystemMediaTransportControlsButton.play) || !this.state.playing) {
      console.log('Play')
      this.audio.play()
    } else {
      this.audio.pause()
    }
  }

  setPlaying () {
    this.setState({ playing: true })

    if (typeof Windows !== 'undefined') {
      this.systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.playing
    }
  }

  setPaused () {
    this.setState({ playing: false })

    if (typeof Windows !== 'undefined') {
      this.systemMediaControls.playbackStatus = Windows.Media.MediaPlaybackStatus.paused
    }
  }

  render (props, state) {
    if (this.audio) this.audio.volume = state.volume / 100
    return Object.keys(props.preview).length > 0 ? (
      <Grid rows={'auto auto auto'} columns={'2fr 70px'} gap='2px'>
        <Cell className='title' width={2}>{props.preview.title}</Cell>
        <Cell className='location' top={2} width={2}>{props.preview.info}</Cell>

        <audio src={props.preview.src} ref={audio => { this.audio = audio }} autoPlay volume={state.volume}
          onPlay={() => this.setPlaying()} onPause={() => this.setPaused()} />

        <Cell top={3}>
          <label>
            Volume
          </label>
          <input type='range' min='0' max='100' onChange={linkState(this, 'volume')} value={state.volume} class='slider' />
        </Cell>

        <Cell top={3} left={2} center middle>
          <Button onClick={() => this.togglePlay()}>{state.playing ? 'Pause' : 'Play'}</Button>
        </Cell>
      </Grid>
    ) : (
      <p>Nothing being previewed</p>
    )
  }
}

export default Player
