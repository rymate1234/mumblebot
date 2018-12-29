import { h } from 'preact'
import styled, { css, injectGlobal, ThemeProvider } from 'styled-components'
import { Grid } from 'styled-css-grid'

injectGlobal`
  * {
    box-sizing: border-box;
    transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  }
  html, body {
    margin: 0;
    max-height: 100vh;
    height: 100vh;
    padding: 0;
    font-family: sans-serif;
    overflow: hidden;
  }

  #audio {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%
  }

  .list {
    flex: 1 1 auto;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  label {
    margin: 0;
    display: block;
  }
  input[type=range] {
    /*removes default webkit styles*/
    -webkit-appearance: none;
    width: 100%;
    
    /*fix for FF unable to apply focus style bug */
    border: 1px solid white;
    margin: 8px 0;
  }
  input[type=range]::-webkit-slider-runnable-track {
      height: 5px;
      background: #ddd;
      border: none;
      border-radius: 3px;
  }
  input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      border: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background:  #111;
      margin-top: -4px;
  }
  input[type=range]:focus {
      outline: none;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
      background: #ccc;
  }

  input[type=range]::-moz-range-track {
      height: 5px;
      background: #ddd;
      border: none;
      border-radius: 3px;
  }
  input[type=range]::-moz-range-thumb {
      border: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #111;
  }

  /*hide the outline behind the border*/
  input[type=range]:-moz-focusring{
      outline: 1px solid white;
      outline-offset: -1px;
  }

  input[type=range]::-ms-track {
      height: 5px;
      
      /*remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead */
      background: transparent;
      
      /*leave room for the larger thumb to overflow with a transparent border */
      border-color: transparent;
      border-width: 6px 0;

      /*remove default tick marks*/
      color: transparent;
  }
  input[type=range]::-ms-fill-lower {
      background: #777;
      border-radius: 10px;
  }
  input[type=range]::-ms-fill-upper {
      background: #ddd;
      border-radius: 10px;
  }
  input[type=range]::-ms-thumb {
      border: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background:  #111;
  }
  input[type=range]:focus::-ms-fill-lower {
      background: #888;
  }
  input[type=range]:focus::-ms-fill-upper {
      background: #ccc;
  }
`
export const Wrapper = styled.div`
  height: 100%;
  transition: all 0.2s ease-in-out;
  max-height: 100vh;
  background: ${state => state.theme.background};
  color: ${state => state.theme.foreground};

  display: flex;
  flex-direction: column;

  ${props => props.row && css`
    flex-direction: row;
    @media (max-width: 768px) {
      position: absolute;
      width: calc(100vw + 300px);
      left: -300px;
      ${props => props.visible && css`
        left: 0;
      `}
      overflow: hidden;
    }
  `}

  overflow: hidden;
  flex: 1 1 auto;
`

export const Link = styled.a`
  color: ${state => state.theme.link};
  ${props => props.padding && css`
    display: inline-block;
    padding: 5px;
  `}

  ${props => props.title && css`
    text-decoration: none;
    color: ${state => state.theme.foreground};
    &::before {
      content: "🔗 ";
    }
  `}
`

export const Sidebar = styled.div`
  flex: 0 0 300px;
  display: flex;
  max-height: 100vh;
  height: 100vh;
  flex-direction: column;
  background: ${state => state.theme.sidebar};
  overflow: auto;
`

export const Header = styled.header`
  background: ${state => state.theme.header};

  color: #fff;
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  display: flex;
`

export const HeaderTitle = styled.a`
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  align-items: center;
  text-overflow: ellipsis;
  padding: 0 2rem;
  font-weight: bold;
  text-decoration: none;
  color: #fff;
`

export const HeaderLink = styled.a`
  line-height: 48px;
  padding: 0 2rem;
  flex: 1 1 50px;
  display: block;
  text-decoration: none;
  color: #fff;
  ${props => props.sidebarLink && css`
    @media (min-width: 768px) {
      display: none;
    }
  `}
`

export const Container = styled.main`
  height: calc(100vh - 48px);
  padding: 10px;
  display: flex;
`

export const Station = styled(Grid)`
  min-height: 56px;
  margin: 0 auto;
  max-width: 100%;
  padding: 6px 3px;
  white-space: nowrap;
  overflow: hidden;
  align-items: center;
  text-overflow: ellipsis;

  ${props => props.highlighted && css`
    background: ${props => props.theme.selected};
  `}

  .title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    align-self: center;
    display: flex;
    align-items: center;
    ${props => !props.saved && css`
      color: ${props => props.theme.foreground};
    `}
  } 
  
  .info {
    ${props => !props.saved && css`
      color: ${props => props.theme.foregroundLight};
    `}
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    align-self: center;
    display: flex;
    align-items: center;
  }

  p {
    padding: 0;
    margin: 0;
  }

  hr {
    display: none;
  }

  audio {
    background: #cccccc11;
  }
`

export const Button = styled.a`
  transition: all 0.2s ease; 
  color: ${props => props.theme.button.text};
  background-color: ${props => props.primary ? props.theme.button.default : props.theme.button.secondary};
  border: none;
  border-radius: 45px;
  padding: 16px;
  display: block;
  line-height: 100%;
  font-size: 12px;
  text-decoration: none;
  text-align: center;

  &:hover {
    background-color: ${props => props.theme.button.hover};
    color: #fff;
  }
`

export const FormButton = Button.withComponent('button')

export const Card = styled.div`
  padding: 5px 20px;
  color: #fff !important;
  z-index: 2;
  width: 100%;
  flex: 0 1 auto;

  ${props => props.expand && css`
    flex: 1 1 100%;
    overflow: auto;
  `}

  audio {
    width: 100%;
  }

  .title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    align-self: center;
    display: flex;
    align-items: center;
  } 
  
  .location {
    font-size: 12px;
    align-self: center;
    display: flex;
    align-items: center;
  }

`

export const Label = styled.label`
  width: 100%;
  display: block;
  line-height: 31px;
  padding-left: 5px;
  font-size: 13.3333px;
  height: 31px;
  color: ${props => props.theme.foreground};
  border: 1px solid ${props => props.theme.selected};
`

export const Input = styled.input`
  padding: 5px;
  height: 31px;
  display: ${props => props.newline ? 'block' : 'inline'};
  width: ${props => props.width || '100%'};
  margin-bottom: 20px;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.foreground};
  border: 1px solid ${props => props.theme.selected};
  &[type='checkbox'] {
    width: auto;
    height: auto;
  }
  &[type='submit'] {
    width: auto;
    color: ${props => props.theme.button.text};
    background-color: ${props => props.theme.button.default};  
  }
  &[type="file"] {
    display: none;
  }
`

export const FormWrap = styled.div`
  display: flex;
  flex-direction: row;
`

export const Themed = ({ darkTheme, muted, children }) => {
  const theme = darkTheme ? {
    header: '#343a40',
    sidebar: '#343a40',
    background: '#222',
    foreground: '#fff',
    foregroundLight: '#aaa',
    button: {
      default: '#007bff',
      text: '#fff',
      secondary: '#343a40',
      hover: '#ffffff77'
    },
    selected: '#4b4d64',
    link: 'hotpink'
  } : {
    header: '#343a40',
    sidebar: '#343a40',
    background: '#eee',
    foreground: '#000',
    foregroundLight: '#555',
    button: {
      default: '#007bff',
      text: '#fff',
      secondary: '#343a40',
      hover: '#00000044'
    },
    selected: '#C5CAE9',
    link: '#3F51B5'
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
