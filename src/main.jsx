import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

const root = document.getElementById('root')

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Prerendered pages ship with markup already in #root — hydrate those,
// mount fresh only in dev where the shell is empty.
if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
