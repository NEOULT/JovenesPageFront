import React, { useState } from 'react'
import { createActividad } from '../services/api'

export default function ActividadForm({ onCreated }) {
  const [form, setForm] = useState({
    titulo: '',
    fecha: '',
    descripcion: '',
    asistentes: '', // comma separated
    ponentes: '' // comma separated
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        titulo: form.titulo,
        fecha: form.fecha,
        descripcion: form.descripcion,
        asistentes: form.asistentes ? form.asistentes.split(',').map(s => s.trim()).filter(Boolean) : [],
        ponentes: form.ponentes ? form.ponentes.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      await createActividad(payload)
      setForm({ titulo: '', fecha: '', descripcion: '', asistentes: '', ponentes: '' })
      onCreated && onCreated()
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 700 }}>
      <h3>Crear actividad / clase</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={onChange} required />
        <input name="fecha" type="date" value={form.fecha} onChange={onChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={onChange} />
        <input name="ponentes" placeholder="Ponentes (ids o cédulas, separadas por coma)" value={form.ponentes} onChange={onChange} />
        <input name="asistentes" placeholder="Asistentes (ids o cédulas, separadas por coma)" value={form.asistentes} onChange={onChange} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear actividad'}</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </form>
  )
}
