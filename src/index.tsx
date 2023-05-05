import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
/* eslint-disable */
import { Buffer } from 'buffer';
global.window.Buffer = Buffer;
import { App } from './App';
/* eslint-enable */

const root = document.getElementById('root');

if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <HashRouter>
                <App />
            </HashRouter>
        </React.StrictMode>
    );
}