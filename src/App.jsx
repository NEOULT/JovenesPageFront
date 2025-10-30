import React, { useEffect, useState } from 'react'
import PersonaForm from './components/PersonaForm'
import AsistenciaRapida from './components/AsistenciaRapida'
import Admin from './pages/Admin'

// Logo: the file is inside the project under `src/public/assets/logo.png` (you uploaded it there).
// Import it so Vite bundles/serves it correctly. If you later move it to the project `public/`
// folder, you can revert to using the absolute `/assets/logo.png` path.
import logo from './public/assets/logo.png'

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')
  // Secret admin route: type or share this hash to access admin
  const SECRET_ADMIN_HASH = '#/__sigma-astral-portal__b2f9a7-91a4'

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isAdmin = route.startsWith(SECRET_ADMIN_HASH)
  const homeSection = (() => {
    if (isAdmin) return null
    const clean = route.startsWith('#/') ? route.slice(2) : ''
    if (clean.startsWith('asistencia')) return 'asistencia'
    return 'registro' // default
  })()

  return (
    <div className="app-container">
      <header className="hero">
        <img className="hero-logo" src={logo} alt="Jóvenes con Propósito" />
        <h2 className="hero-subtitle">Ministerio Jóvenes con Propósito</h2>
        <nav style={{ marginTop: 10 }}>
          <a href="#/" style={{ textDecoration: 'none', color: isAdmin ? '#6b7280' : '#111827', fontWeight: isAdmin ? 400 : 500 }}>Inicio</a>
          {/* Admin link intentionally omitted to keep route hidden */}
        </nav>
      </header>

      {isAdmin ? (
        <main className="content">
          <Admin />
        </main>
      ) : (
        <main className="content">
          <nav style={{ gridColumn: '1 / -1', margin: '0 auto 8px', display: 'flex', gap: 8, maxWidth: 980, width: '100%', justifyContent: 'center' }}>
            <a href="#/registro" className="p-button p-button-text p-button-sm" style={{ textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: homeSection==='registro' ? 'rgba(127,159,176,0.12)' : 'transparent' }}>Soy nuevo</a>
            <a href="#/asistencia" className="p-button p-button-text p-button-sm" style={{ textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: homeSection==='asistencia' ? 'rgba(127,159,176,0.12)' : 'transparent' }}>Marcar mi asistencia</a>
          </nav>

          {homeSection === 'registro' && (
            <section className="card" style={{ gridColumn: '1 / -1', maxWidth: 980, width: '100%', margin: '0 auto' }}>
              <h3 style={{ textAlign: 'center', marginTop: 0, color: 'var(--muted)' }}>Registrar persona</h3>
              <div className="center-form">
                <PersonaForm />
              </div>
            </section>
          )}

          {homeSection === 'asistencia' && (
            <section className="card" style={{ gridColumn: '1 / -1', maxWidth: 980, width: '100%', margin: '0 auto' }}>
              <h3 style={{ textAlign: 'center', marginTop: 0, color: 'var(--muted)' }}>Marcar asistencia</h3>
              <AsistenciaRapida />
            </section>
          )}
        </main>
      )}

      <footer className="footer">© {new Date().getFullYear()} Jóvenes con Propósito</footer>
    </div>
  )
}
