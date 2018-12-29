import { h, Component } from 'preact'
import { connect } from 'unistore/preact'
import VirtualList from 'preact-virtual-list'
import SongRow from './components/SongRow'
import { actions } from './store'

class List extends Component {
  constructor () {
    super()

    this.renderRow = this.renderRow.bind(this)
  }

  renderRow (channel, key) {
    return <SongRow item={channel} key={`${channel._id}-${key}`} />
  }

  render (props) {
    let viewAll = props.path.includes('all')
    let channels = props.filtered.length ? props.filtered : props.pageData.list
    return !viewAll ? (
      <VirtualList overscanCount={30} class='list' data={channels} rowHeight={56} renderRow={this.renderRow} />
    ) : (
      <div class='list'>
        {channels.map(this.renderRow)}
      </div>
    )
  }
}

export default connect('pageData,filtered', actions)(List)
