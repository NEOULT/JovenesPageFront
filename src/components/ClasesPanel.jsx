import React, { useEffect, useState } from 'react'
import { getActividades, createActividad, getPersonas } from '../services/api'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { InputTextarea } from 'primereact/inputtextarea'
import { MultiSelect } from 'primereact/multiselect'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

export default function ClasesPanel() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [personasOpts, setPersonasOpts] = useState([])
  const [form, setForm] = useState({ titulo: '', fecha: null, descripcion: '', asistentes: [], ponentes: [] })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [actividades, personas] = await Promise.all([
        getActividades(),
        getPersonas({ limit: 200 }),
      ])
      setList(Array.isArray(actividades) ? actividades : [])
      const opts = (Array.isArray(personas?.items || personas) ? (personas.items || personas) : []).map(p => ({
        label: `${p.nombre || ''} ${p.apellido || ''}${p.cedula ? ` (${p.cedula})` : ''}`.trim(),
        value: p._id || p.id,
      })).filter(o => o.value)
      setPersonasOpts(opts)
    } catch (e) {
      setError(e.message || 'Error al cargar clases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = {}
    if (!form.titulo) errs.titulo = 'El título es requerido'
    if (!form.fecha) errs.fecha = 'La fecha es requerida'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    try {
      setSaving(true)
      const payload = { ...form }
      if (payload.fecha instanceof Date) {
        payload.fecha = payload.fecha.toISOString().slice(0,10)
      }
      if (!payload.descripcion) delete payload.descripcion
      if (!payload.asistentes || payload.asistentes.length === 0) delete payload.asistentes
      if (!payload.ponentes || payload.ponentes.length === 0) delete payload.ponentes
      await createActividad(payload)
      setForm({ titulo: '', fecha: null, descripcion: '', asistentes: [], ponentes: [] })
      await load()
    } catch (e) {
      setError(e.message || 'Error al crear la clase')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sm-form">
      <form onSubmit={onSubmit} className="p-fluid" style={{ marginBottom: 10 }}>
        <div className="formgrid grid">
          <div className="field col-12 sm:col-6">
            <span className="p-float-label">
              <InputText id="titulo" className={`p-inputtext-sm ${fieldErrors.titulo ? 'p-invalid' : ''}`} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <label htmlFor="titulo">Título de la clase</label>
            </span>
            {fieldErrors.titulo && <small className="p-error">{fieldErrors.titulo}</small>}
          </div>
          <div className="field col-12 sm:col-6">
            <span className="p-float-label">
              <Calendar inputId="fecha" id="fecha" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.value })} className={fieldErrors.fecha ? 'p-invalid' : ''} inputClassName={`p-inputtext-sm ${fieldErrors.fecha ? 'p-invalid' : ''}`} dateFormat="yy-mm-dd" showIcon />
              <label htmlFor="fecha">Fecha (YYYY-MM-DD)</label>
            </span>
            {fieldErrors.fecha && <small className="p-error">{fieldErrors.fecha}</small>}
          </div>
          <div className="field col-12">
            <span className="p-float-label">
              <InputTextarea id="descripcion" autoResize rows={3} className="p-inputtext-sm" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              <label htmlFor="descripcion">Descripción (opcional)</label>
            </span>
          </div>
          <div className="field col-12 sm:col-6">
            <span className="p-float-label">
              <MultiSelect inputId="asistentes" value={form.asistentes} options={personasOpts} onChange={(e) => setForm({ ...form, asistentes: e.value })} display="chip" className="p-inputtext-sm" placeholder="Selecciona asistentes" filter />
              <label htmlFor="asistentes">Asistentes</label>
            </span>
          </div>
          <div className="field col-12 sm:col-6">
            <span className="p-float-label">
              <MultiSelect inputId="ponentes" value={form.ponentes} options={personasOpts} onChange={(e) => setForm({ ...form, ponentes: e.value })} display="chip" className="p-inputtext-sm" placeholder="Selecciona ponentes" filter />
              <label htmlFor="ponentes">Ponentes</label>
            </span>
          </div>
          <div className="col-12" style={{ textAlign: 'right' }}>
            <Button type="submit" label="Crear" icon="pi pi-plus" loading={saving} className="p-button-sm" />
          </div>
        </div>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <DataTable value={list} size="small" paginator rows={10} rowsPerPageOptions={[10,20,50]} responsiveLayout="scroll">
          <Column field="titulo" header="Título" sortable body={(r)=> r.titulo || r.nombre || r.name} />
          <Column field="fecha" header="Fecha" sortable body={(r)=> (r.fecha || '').slice(0,10)} />
          <Column header="# Asist." body={(r)=> (r.asistentes ? r.asistentes.length : 0)} />
          <Column header="# Pon." body={(r)=> (r.ponentes ? r.ponentes.length : 0)} />
        </DataTable>
      )}
    </div>
  )
}
