import React from 'react'
import ReactDOM from 'react-dom/client'
import Overlay from './Overlay'
import '../index.css'

const init = () => {
  const rootElement = document.createElement('div')
  rootElement.id = 'promptcam-root'
  // make it on top of everything
  rootElement.style.position = 'fixed'
  rootElement.style.zIndex = '999999'
  rootElement.style.top = '0'
  rootElement.style.left = '0'
  document.body.appendChild(rootElement)

  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <Overlay />
    </React.StrictMode>,
  )
}

init();
