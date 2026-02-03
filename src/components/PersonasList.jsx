import React, { useEffect, useState } from 'react'
import { getPersonas } from '../services/api'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

export default function PersonasList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [cedula, setCedula] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await getPersonas({
        cedula: cedula || undefined,
        nombreCompleto: nombreCompleto || undefined,
      })
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
      <div className="flex align-items-center justify-content-between" style={{ marginBottom: 10, gap: 8 }}>
        <h3 style={{ margin: 0, color: 'var(--accent-2)' }}>Jóvenes</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button label="Buscar" icon="pi pi-filter" className="p-button-sm" onClick={load} />
          <Button label="Limpiar" icon="pi pi-times" className="p-button-sm p-button-secondary" onClick={() => { setCedula(''); setNombreCompleto(''); load() }} />
        </div>
      </div>

      <div className="flex align-items-center gap-2" style={{ marginBottom: 10, flexWrap: 'wrap', rowGap: 8 }}>
        <span className="p-input-icon-left" style={{ flex: '1 1 140px', minWidth: 120 }}>
          <i className="pi pi-search" />
          <InputText
            className="p-inputtext-sm"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            style={{ width: '100%' }}
          />
        </span>
        <span className="p-input-icon-left" style={{ flex: '2 1 220px', minWidth: 180 }}>
          <i className="pi pi-user" />
          <InputText
            className="p-inputtext-sm"
            placeholder="Nombre completo"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            style={{ width: '100%' }}
          />
        </span>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
          <div className="personas-table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <DataTable value={list} size="small" scrollable scrollHeight="320px" scrollDirection="both" className="personas-table-compact" style={{ minWidth: 1200 }}>
              <Column field="nombre" header="Nombre" sortable style={{ minWidth: 140 }} />
              <Column field="apellido" header="Apellido" sortable style={{ minWidth: 160 }} />
              <Column field="cedula" header="Cédula" sortable style={{ minWidth: 120 }} />
              <Column field="email" header="Email" style={{ minWidth: 220 }} />
              <Column field="telefono" header="Teléfono" style={{ minWidth: 140 }} />
              <Column field="fecha_nacimiento" header="Fecha Nacimiento" style={{ minWidth: 160 }} />
              <Column field="bautizado" header="Bautizado" style={{ minWidth: 100 }} body={rowData => rowData.bautizado ? 'Sí' : 'No'} />
              <Column field="genero" header="Género" style={{ minWidth: 80 }} />
              <Column field="ministerio" header="Ministerio" style={{ minWidth: 200 }} />
              <Column field="nivel_academico" header="Nivel Académico" style={{ minWidth: 220 }} />
              <Column field="ocupacion" header="Ocupación" style={{ minWidth: 180 }} />
            </DataTable>
          </div>
      )}
    </div>
  )
}
