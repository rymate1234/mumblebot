import { h, Component } from 'preact'
import List from './list'
import { Wrapper } from './components'
import Forms from './components/forms'

export default (props) => (
  <Wrapper>
    <Forms />
    <List {...props} />
  </Wrapper>
)