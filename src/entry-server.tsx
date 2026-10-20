import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// Build-time only: renders the page to static HTML so crawlers that skip JavaScript still read it.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
