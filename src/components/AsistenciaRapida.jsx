import React, { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { getPersonas, getActividadesSemana, asistirActividad } from '../services/api'

export default function AsistenciaRapida(){
  const [term, setTerm] = useState('')
  const [found, setFound] = useState(null)
  const [clase, setClase] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toastRef = React.useRef(null)

  const extractItems = (res) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.items)) return res.items
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.data?.items)) return res.data.items
    return []
  }

  const search = async () => {
    setLoading(true)
    setError('')
    setFound(null)
    setClase(null)
    try {
      const isDigits = /^\d+$/.test(term.trim())
      // Pide hasta 2 para saber si es único; si hay 0 o >1 no mostramos resultado
      const params = isDigits ? { cedula: term.trim() } : { nombreCompleto: term.trim() }
      const personasRes = await getPersonas(params)
      const personas = extractItems(personasRes)
      const persona = personas[0]
      setFound(persona)
      const today = new Date().toISOString().slice(0,10)
      const semanaRes = await getActividadesSemana({ fecha: today })
      const clases = extractItems(semanaRes)
      if (clases.length !== 1){
        setError('No hay una única clase esta semana para marcar asistencia')
        return
      }
      setClase(clases[0])
    } catch (e) {
      setError(e.message || 'Error al buscar')
    } finally {
      setLoading(false)
    }
  }

  const confirmar = async () => {
    if (!found?._id || !clase?._id) return
    setLoading(true)
    setError('')
    try {
      const res = await asistirActividad(clase._id, found._id)
      if (toastRef.current){
        toastRef.current.show({ severity: 'success', summary: '¡Listo!', detail: res?.registered ? 'Asistencia registrada ✅' : 'Ya estabas registrado 👌', life: 2800 })
      }
      setTerm('')
      setFound(null)
      setClase(null)
    } catch (e) {
      setError(e.message || 'No se pudo registrar asistencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sm-form" style={{ maxWidth: 980, margin: '0 auto' }}>
      <Toast ref={toastRef} position="bottom-right" className="toast-clean" />
      <div className="formgrid grid" style={{ alignItems: 'center' }}>
        <div className="field col-12 sm:col-8">
          <span className="p-input-icon-left" style={{ width: '100%' }}>
            <i className="pi pi-search" />
            <InputText
              className="p-inputtext-sm"
              placeholder="Cédula o Nombre completo"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e)=> { if(e.key==='Enter'){ e.preventDefault(); search(); } }}
              style={{ width: '100%' }}
            />
          </span>
        </div>
        <div className="field col-12 sm:col-4" style={{ display: 'flex', gap: 8 }}>
          <Button label="Buscar" icon="pi pi-filter" className="p-button-sm" onClick={search} loading={loading} />
          <Button label="Limpiar" icon="pi pi-times" className="p-button-sm p-button-secondary" onClick={()=>{ setTerm(''); setFound(null); setClase(null); setError('') }} />
        </div>

        {error && (
          <div className="col-12" style={{ color: 'red' }}>{error}</div>
        )}

        {found && (
          <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <strong>{found.nombre} {found.apellido}</strong>
              {clase?.titulo && <span style={{ color:'#6b7280' }}> — Clase: {clase.titulo}</span>}
            </div>
            <div>
              <Button label="Sí, Asistí a Clase" icon="pi pi-check" className="p-button-sm" onClick={confirmar} disabled={!clase || loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
