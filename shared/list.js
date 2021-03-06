import { h, Component } from 'preact'
import { connect } from 'unistore/preact'
import VirtualList from 'preact-virtual-list'
import SongRow from './components/SongRow'
import { actions } from './store'

class List extends Component {
  state = {
    channels: this.props.filtered.length
      ? this.props.filtered
      : this.props.pageData.list,
  }

  renderRow = (channel, key) => {
    return <SongRow item={channel} />
  }

  componentWillReceiveProps(props) {
    this.setState({
      channels: props.filter ? props.filtered : props.pageData.list,
    })
    this.forceUpdate() // argh
  }

  render(props, state) {
    if (props.filter && props.filtered.length === 0) {
      return <h1>No songs found rip</h1>
    }

    let viewAll = props.path.includes('all')
    return !viewAll ? (
      <VirtualList
        overscanCount={12}
        class="list"
        data={state.channels}
        rowHeight={56}
        renderRow={this.renderRow}
        sync
      />
    ) : (
      <div class="list">{state.channels.map(this.renderRow)}</div>
    )
  }
}

export default connect('pageData,filtered,filter', actions)(List)
