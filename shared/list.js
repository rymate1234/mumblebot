import { h, Component } from 'preact'
import { connect } from 'unistore/preact'
import VirtualList from 'preact-virtual-list'
import StationRow from './song-row'
import { actions } from './store'

class List extends Component {
  constructor () {
    super()

    this.renderRow = this.renderRow.bind(this)
  }

  renderRow (channel, key) {
    return <StationRow item={channel} key={`${channel._id}-${key}`} />
  }

  render (props, state) {
    let channels = props.pageData.list
    return (
      <VirtualList overscan={30} class='list' data={channels} rowHeight={56} renderRow={this.renderRow} />
    )
  }
}

export default connect('pageData', actions)(List)
