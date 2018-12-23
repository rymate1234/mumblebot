import { h } from 'preact'
import { Link } from './components'

const about = () => (
  <div>
    <h1>What is this?</h1>
    <p>
      MiniRadio is a lightweight radio app for the web. Using data from <Link href='http://radio.garden/'>Radio Garden</Link>,
      this app allows you to find and listen to stations from around the world without rendering an entire globe.
    </p>

    <p>
      Powered by preact, styled components, and a couple other web technologies,
      MiniRadio is fully open source: just append /_src to the end of the URL!
    </p>
  </div>
)

export default about
