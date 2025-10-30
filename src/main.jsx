import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// PrimeReact styles (themes, core, icons, utilities)
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeflex/primeflex.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
