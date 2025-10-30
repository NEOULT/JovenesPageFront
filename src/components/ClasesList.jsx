import React, { useEffect, useState } from 'react'
import { getActividades } from '../services/api'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

export default function ClasesList({ reloadSignal = 0 }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getActividades()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Error al cargar clases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (reloadSignal) load() }, [reloadSignal])

  if (loading) return <div>Cargando...</div>
  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <DataTable value={list} size="small" paginator rows={10} rowsPerPageOptions={[10,20,50]} responsiveLayout="scroll">
        <Column field="titulo" header="Título" sortable body={(r)=> r.titulo || r.nombre || r.name} />
        <Column field="fecha" header="Fecha" sortable body={(r)=> (r.fecha || '').slice(0,10)} />
        <Column header="# Asist." body={(r)=> (r.asistentes ? r.asistentes.length : 0)} />
        <Column header="# Pon." body={(r)=> (r.ponentes ? r.ponentes.length : 0)} />
      </DataTable>
    </div>
  )
}
