import { h } from 'preact'
import {Station,Button, Link, Cell } from '../components'
import { connect } from 'unistore/preact'
import { actions } from '../store'

const QueueRow = ({item}) => (

    <Station columns='2fr auto' rows={2} gap='2px'>
        <Cell className='title'>
        
        </Cell>
        <Cell>
            <input type='hidden' name='json' value='1337'></input>
            <Button>
                Remove
            </Button>
        </Cell>
    </Station>
)


