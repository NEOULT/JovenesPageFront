import React, { useEffect, useState } from 'react'
import PersonasList from '../components/PersonasList'
import ClaseForm from '../components/ClaseForm'
import ClasesList from '../components/ClasesList'

export default function Admin() {
  const SECRET_ADMIN_HASH = '#/__sigma-astral-portal__b2f9a7-91a4'
  const [hash, setHash] = useState(window.location.hash)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const getSection = () => {
    if (!hash.startsWith(SECRET_ADMIN_HASH)) return 'jovenes'
    const rest = hash.slice(SECRET_ADMIN_HASH.length) || ''
    const clean = rest.startsWith('/') ? rest.slice(1) : rest
    if (clean.startsWith('clases')) return 'clases'
    if (clean.startsWith('jovenes') || clean.startsWith('personas')) return 'jovenes'
    return 'jovenes'
  }

  const section = getSection()

  return (
    <>
      <nav style={{ gridColumn: '1 / -1', margin: '0 auto 8px', display: 'flex', gap: 8, maxWidth: 980, width: '100%' }}>
        <a href={`${SECRET_ADMIN_HASH}/jovenes`} className="p-button p-button-text p-button-sm" style={{ textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: section==='jovenes' ? 'rgba(127,159,176,0.12)' : 'transparent' }}>Jóvenes</a>
        <a href={`${SECRET_ADMIN_HASH}/clases`} className="p-button p-button-text p-button-sm" style={{ textDecoration: 'none', padding: '6px 10px', borderRadius: 8, background: section==='clases' ? 'rgba(127,159,176,0.12)' : 'transparent' }}>Clases</a>
      </nav>

      {section === 'jovenes' && (
        <section className="card" style={{ gridColumn: '1 / -1', maxWidth: 980, margin: '0 auto', width: '100%' }}>
          <PersonasList />
        </section>
      )}

      {section === 'clases' && (
        <section className="card" style={{ gridColumn: '1 / -1', maxWidth: 980, margin: '0 auto', width: '100%' }}>
          <div className="formgrid grid">
            <div className="field col-12" style={{ marginBottom: 6 }}>
              <ClaseForm onCreated={() => setReload(r => r + 1)} />
            </div>
            <div className="field col-12">
              <ClasesList reloadSignal={reload} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
