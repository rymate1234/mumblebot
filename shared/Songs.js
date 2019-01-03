import { h } from 'preact'
import List from './list'
import { Wrapper } from './components'
import Forms from './components/Forms'

const Songs = (props) => (
  <Wrapper>
    <Forms />
    <List {...props} />
  </Wrapper>
)

export default Songs
