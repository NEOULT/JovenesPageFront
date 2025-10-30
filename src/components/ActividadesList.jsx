import React, { useEffect, useState } from 'react'
import { getActividades } from '../services/api'

export default function ActividadesList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getActividades()
      setList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Actividades / Clases</h3>
      {loading ? <div>Cargando...</div> : (
        <div>
          {list.length === 0 && <div>No hay actividades.</div>}
          {list.map(a => (
            <div key={a._id} style={{ padding: 8, border: '1px solid #ddd', marginBottom: 8, borderRadius: 4 }}>
              <strong>{a.titulo}</strong> — <em>{a.fecha}</em>
              <div>{a.descripcion}</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Ponentes: {Array.isArray(a.ponentes) ? a.ponentes.join(', ') : ''}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Asistentes: {Array.isArray(a.asistentes) ? a.asistentes.join(', ') : ''}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <button onClick={load}>Refrescar</button>
      </div>
    </div>
  )
}
