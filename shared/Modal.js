import { h } from 'preact'
import styled, { css } from 'styled-components'
import { Wrapper } from './components'

const Mask = styled.div`
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  visibility: hidden;
  transition: all .3s ease;
  opacity: 0;
  display: table;
  ${props => props.visible && css`
    visibility: visible;
    opacity: 1;
  `}
`

const Wrap = styled.div`
  display: table-cell;
  vertical-align: middle;
`

const Modal = styled(Wrapper)`
  max-width: 400px;
  width: 100%;
  height: auto;
  margin: 0px auto;
  padding: 10px;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  ${props => props.visible && css`
    opacity: 1;
  `}
`

export default props => {
  const { children, closeModal, visible } = props
  return (
    <Mask onClick={closeModal} {...props}>
      <Wrap>
        <Modal {...props}>
          {visible ? children : ''}
        </Modal>
      </Wrap>
    </Mask>
  )
}
