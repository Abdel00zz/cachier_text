import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MathJaxContext } from 'better-react-mathjax';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const config = {
  loader: { load: ["input/tex", "output/svg"] },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    processEscapes: true,
  },
  svg: {
    fontCache: 'global'
  }
};


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MathJaxContext config={config}>
      <App />
    </MathJaxContext>
  </React.StrictMode>
);