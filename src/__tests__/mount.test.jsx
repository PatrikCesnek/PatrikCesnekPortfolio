import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrowserRouter } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App.jsx'
import { ENTRIES } from '../content/entries.js'

/**
 * Mounts the app the way a browser does — createRoot, effects and all.
 *
 * The SSR tests use renderToStaticMarkup, which never runs an effect, so this
 * is the only place a browser-only crash can surface. It exists because the
 * app once rendered perfectly under SSR while every effect went unexercised.
 */

let container
let errors

beforeEach(() => {
  errors = []
  vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(String(args[0])))
})

afterEach(() => {
  vi.restoreAllMocks()
  container?.remove()
})

/** A fresh container each time — createRoot must never see a reused one. */
const mount = async (path = '/') => {
  container?.remove()
  container = document.createElement('div')
  container.id = 'root'
  document.body.appendChild(container)

  window.history.pushState({}, '', path)
  await act(async () => {
    createRoot(container).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
  })
}

describe('client mount', () => {
  it('mounts and paints the shell', async () => {
    await mount()
    expect(container.textContent).toContain('Patrik Cesnek')
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('runs every effect without logging a React error', async () => {
    await mount()
    expect(errors).toEqual([])
  })

  it('paints the hero, the track and the card grid', async () => {
    await mount()
    expect(container.querySelector('[role="slider"]')).not.toBeNull()
    expect(container.textContent).toContain('Apex Ryde')
  })

  it('mounts every route cleanly', async () => {
    for (const path of ['/lab', '/about', '/cv', '/cs', '/sk/cv']) {
      await mount(path)
      expect(container.querySelector('main'), path).not.toBeNull()
      expect(errors, path).toEqual([])
    }
  })

  it('reveals cards rather than leaving them invisible without JS', async () => {
    await mount()
    // Server-rendered markup must carry no reveal state at all, so a crawler
    // or a no-JS visitor sees plain visible content.
    const ssr = renderToStaticMarkup(
      <StaticRouter location="/">
        <App />
      </StaticRouter>
    )
    expect(ssr).not.toContain('data-reveal="pending"')
  })

  it('mounts every project page cleanly', async () => {
    for (const e of ENTRIES) {
      await mount(`/projects/${e.slug}`)
      expect(container.textContent, e.slug).toContain(e.title)
      expect(errors, e.slug).toEqual([])
    }
  })
})
