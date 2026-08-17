import { Component } from 'react'

/**
 * Catches a render-time crash below it and renders `fallback(error)` instead
 * of letting React unmount the tree into a blank white page.
 *
 * Two things it deliberately does not do:
 *
 * - It does not reset itself. App mounts it inside the element keyed on the
 *   pathname, so any navigation already replaces the instance with a clean
 *   one — a visitor is never stuck. A second reset path would be a second
 *   thing to keep correct.
 * - It does not run on the server. React has no error boundaries during
 *   renderToString; the render aborts instead. That is the behaviour we want
 *   at build time — a page that throws should fail `npm run build` loudly
 *   rather than ship a prerendered apology to every crawler.
 *
 * @param {(error: Error) => import('react').ReactNode} fallback
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // A static site has nowhere to report to, so the console is the log.
    // Keeping the component stack matters: the fallback deliberately shows
    // the visitor a message, not a trace.
    console.error('Unhandled error while rendering the page:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    return error ? this.props.fallback(error) : this.props.children
  }
}
