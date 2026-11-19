import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) { console.error(err) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto my-10 max-w-xl rounded-lg border border-matrix/30 bg-panel p-6 text-center">
        <p className="font-mono text-sm text-matrix">{this.props.label ?? 'This section'} failed to load.</p>
        <button type="button" className="btn-ghost mt-4" onClick={() => this.setState({ failed: false })}>Retry</button>
      </div>
    )
  }
}
