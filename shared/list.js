import { h } from 'preact'
import { PureComponent } from 'react'
import { connect } from 'unistore/preact'
import VirtualList from 'preact-virtual-list'
import SongRow from './components/SongRow'
import { actions } from './store'
const isClient = typeof window !== 'undefined'

class List extends PureComponent {
  state = {
    channels: this.props.filtered.length ? this.props.filtered : this.props.pageData.list
  }

  renderRow = (channel, key) => {
    return <SongRow key={key} item={channel} />
  }

  componentWillReceiveProps (props) {
    this.setState({ channels: props.filter ? props.filtered : props.pageData.list })
    this.forceUpdate() // argh
  }

  render (props, state) {
    if (props.filter && props.filtered.length === 0) {
      return <h1>No songs found rip</h1>
    }

    const viewAll = props.path.includes('all')

    return !viewAll && isClient ? (
      <VirtualList overscanCount={12} class='list' data={state.channels} rowHeight={56} renderRow={this.renderRow} sync />
    ) : (
      <div class='list'>
        {/* Bonus divs! */}
        <div>
          <div>
            {state.channels.map(this.renderRow)}
          </div>
        </div>
      </div>
    )
  }
}

export default connect('pageData,filtered,filter', actions)(List)
