import { h } from 'preact'
import { Station, Button } from './components'
import { connect } from 'unistore/preact'
import { actions } from './store'
import { Cell } from 'styled-css-grid'

const StationRow = ({ item, preview, queue, playLocal }) => (
  <Station highlighted={preview.title === item.title} href={item.src} columns='2fr auto' rows={2} gap='2px'>
    <Cell className='title'>{item.title}</Cell>
    <Cell className='info' top={2}>Uploaded on {item.date}</Cell>
    <Cell left={2} height={2}><Button onClick={() => queue(item)}>Queue</Button></Cell>
    <Cell left={3} height={2}><Button onClick={() => playLocal(item)}>Preview</Button></Cell>
    { item.website && <Cell height={4} left={3}><Button href={item.website}>🔗</Button></Cell> }
  </Station>
)

export default connect('preview', actions)(StationRow)
