import { h } from 'preact'
import List from './list'
import { Wrapper } from './styles'
import Forms from './components/Forms'

const Songs = (props) => (
  <Wrapper>
    <Forms />
    <List {...props} />
  </Wrapper>
)

export default Songs
