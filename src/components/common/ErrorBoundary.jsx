import { Component } from 'react';
export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)' }}>Erreur inattendue</h2>
          <p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError: false })}>Réessayer</button>
        </div>
      );
    }
    return this.props.children;
  }
}
