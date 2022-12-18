// 1) Import React and ReactDOM Librariers
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import { HashRouter } from 'react-router-dom';

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.getElementById('root')
);


// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(<App />);
