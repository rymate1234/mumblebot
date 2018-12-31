import { h } from 'preact'
import { Station, Button, Link, Cell } from '../components'
import { connect } from 'unistore/preact'
import { actions } from '../store'
import QueueButton from './QueueButton'

const SongLink = ({ item }) => {
  const isLink = item.website || (item.originalname && item.originalname.startsWith('http'))
  const Component = isLink ? Link : 'strong'

  return <Component target='_blank' title href={item.website || item.originalname}>
    {item.title}
  </Component>
}

const SongRow = ({ item, preview, setPreview }) => (
  <Station highlighted={preview.title === item.title} columns='2fr auto' rows={2} gap='2px'>
    <hr />
    <Cell className='title'>
      <SongLink item={item} />
    </Cell>
    <Cell className='info' top={2}>
      <p>
        {item.info}
      </p>
    </Cell>
    <Cell left={2} height={2}>
      <QueueButton data={item}>Queue</QueueButton>
    </Cell>
    <Cell left={3} height={2}>
      <Button target='_blank' href={item.src} onClick={e => setPreview({ e, item })}>
        Preview
      </Button>
    </Cell>
  </Station>
)

export default connect('preview', actions)(SongRow)
