import React, { useRef, useState, useEffect } from 'react'
import { createPersona, getActividadesSemana, asistirActividad } from '../services/api'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import 'primeflex/primeflex.css'

export default function PersonaForm({ onCreated }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: null,
    bautizado: false,
    genero: 'M',
    ministerio: '',
    nivel_academico: '',
    ocupacion: '',
    cedula: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const isSundayToday = new Date().getDay() === 2
  const telRef = useRef(null)
  const toastRef = useRef(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const confettiRef = useRef(null)
  const [welcomeName, setWelcomeName] = useState('')

  useEffect(() => {
    if (showWelcome && confettiRef.current) {
      // lazy-load/start confetti
      try { startConfetti(confettiRef.current) } catch (e) { /* ignore */ }
    }
  }, [showWelcome])

  const onChange = (e, name) => {
    const val = e && e.target ? e.target.value : e
    setForm(prev => ({ ...prev, [name]: val }))
  }

  const onCheckboxChange = (e, name) => {
    const checked = e && e.checked !== undefined ? e.checked : (e && e.target ? e.target.checked : false)
    setForm(prev => ({ ...prev, [name]: checked }))
  }

  // Prefill from hash query: #/registro?cedula=... or ?nombre=...
  React.useEffect(() => {
    const hash = window.location.hash || ''
    const qIndex = hash.indexOf('?')
    if (qIndex === -1) return
    const query = hash.slice(qIndex + 1)
    const params = new URLSearchParams(query)
    const ced = params.get('cedula')
    const nom = params.get('nombre')
    if (ced || nom) {
      setForm(prev => {
        const next = { ...prev }
        if (ced) next.cedula = String(ced).replace(/\D/g, '').slice(-8)
        if (nom) {
          const words = String(nom).trim().split(/\s+/)
          next.nombre = words.shift() || ''
          next.apellido = words.join(' ')
        }
        return next
      })
      // Clear query to avoid re-applying
      try { window.history.replaceState(null, '', '#/registro') } catch {}
    }
  }, [])

  // Phone: format display but store only digits; disallow leading zero
  const onPhoneChange = (e) => {
    const value = e?.target?.value || ''
    // Remove all non-digits, strip leading zeros, and limit to 10 characters
    const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10)
    setForm(prev => ({ ...prev, telefono: digits }))
  }

  // Format phone for display only
  const formatPhoneDisplay = (digits) => {
    if (!digits) return ''
    const cleanDigits = digits.replace(/\D/g, '')
    if (cleanDigits.length <= 3) return cleanDigits
    if (cleanDigits.length <= 6) return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3)}`
    if (cleanDigits.length <= 8) return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`
    return `${cleanDigits.slice(0, 3)}-${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 8)}-${cleanDigits.slice(8, 10)}`
  }

  // Cedula: persistent 00.000.000 display (right-to-left fill) while storing digits
  const formatCedulaDisplay = (digits) => {
    const p = (digits || '').replace(/\D/g, '').slice(0, 8).padStart(8, '0')
    return `${p.slice(0, 2)}.${p.slice(2, 5)}.${p.slice(5)}`
  }

  const onCedulaChange = (e) => {
    const value = e?.target?.value || ''
    // Keep the rightmost 8 digits so input fills from the right visually
    const digits = value.replace(/\D/g, '').slice(-8)
    setForm(prev => ({ ...prev, cedula: digits }))
  }

  const validateEmail = (email) => {
    // Email is optional; only validate when provided
    if (!email) return ''
    const re = /^(?:[a-zA-Z0-9_'^&\+\-])+(?:\.(?:[a-zA-Z0-9_'^&\+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
    return re.test(email) ? '' : 'Correo inválido'
  }

  const validateNombre = (nombre) => {
    if (!nombre) return 'El nombre es requerido'
    return ''
  }

  const validateApellido = (apellido) => {
    if (!apellido) return 'El apellido es requerido'
    return ''
  }

  const validateFechaNacimiento = (fecha) => {
    if (!fecha) return 'La fecha de nacimiento es requerida'
    return ''
  }

  // Compute age from a Date or ISO date string
  const getAgeFromDate = (value) => {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date)) return null
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }

  const validateBeforeSubmit = () => {
    const errors = {}
  const emailErr = validateEmail(form.email)
  const nombreErr = validateNombre(form.nombre)
  const apellidoErr = validateApellido(form.apellido)
  const fechaErr = validateFechaNacimiento(form.fecha_nacimiento)

    if (emailErr) errors.email = emailErr
    if (nombreErr) errors.nombre = nombreErr
    if (apellidoErr) errors.apellido = apellidoErr
    if (fechaErr) errors.fecha_nacimiento = fechaErr
    if (form.telefono && form.telefono.length !== 10) {
      errors.telefono = 'Teléfono debe tener 10 dígitos'
    }
    if (form.cedula && form.cedula.length < 7) {
      errors.cedula = 'Cédula inválida'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(e) {
    console.log(typeof form.cedula);
    
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!isSundayToday) { setLoading(false); setError('Solo se puede registrar los domingos'); return }
      if (!validateBeforeSubmit()) { setLoading(false); return }
      const payload = { ...form }
      // Trim leading zeros in cedula and send as Number (omit if empty after trim)
      if (payload.cedula != null) {
        const trimmed = String(payload.cedula).replace(/\D/g, '').replace(/^0+/, '')
        if (trimmed !== '') {
          payload.cedula = Number(trimmed)
        } else {
          delete payload.cedula
        }
      }
      // convert date to YYYY-MM-DD if Date object
      if (payload.fecha_nacimiento instanceof Date) {
        const d = payload.fecha_nacimiento
        payload.fecha_nacimiento = d.toISOString().slice(0, 10)
      }
      // Remove empty-string fields from payload (keep false/0/null as-is)
      for (const key of Object.keys(payload)) {
        if (payload[key] === '') {
          delete payload[key]
        }
      }
      const created = await createPersona(payload)
      const createdPersona = created?.data || created // handle either {data:{...}} or the object directly

      // After creation, check weekly classes; if exactly one, auto-register attendance
      let asistenciaDetalle = null
      try {
        const today = new Date().toISOString().slice(0, 10)
        const semana = await getActividadesSemana({ fecha: today })
        const arr = Array.isArray(semana) ? semana : (Array.isArray(semana?.data) ? semana.data : [])
        if (arr.length === 1 && createdPersona?._id) {
          const clase = arr[0]
          const claseId = clase?._id || clase?.id
          if (claseId) {
            const res = await asistirActividad(claseId, createdPersona._id)
            asistenciaDetalle = { titulo: clase?.titulo || clase?.nombre || 'Clase', registered: !!res?.registered }
          }
        }
      } catch (e) {
        // Non-blocking: ignore asistencia errors silently for now
      }
      // Success snackbar
      if (toastRef.current) {
        const extra = asistenciaDetalle ? ` y asistencia marcada en ${asistenciaDetalle.titulo}` : ''
        toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: `Joven registrado exitosamente${extra}`, life: 3000 })
        // set welcome name and show centered welcome overlay with confetti
        const nameToShow = createdPersona?.nombre || createdPersona?.name || ''
        setWelcomeName(nameToShow)
        setShowWelcome(true)
        // hide after a short while and clear welcome name
        setTimeout(() => { setShowWelcome(false); setWelcomeName('') }, 3800)
      }
      setForm({ nombre: '', apellido: '', email: '', telefono: '', fecha_nacimiento: null, bautizado: false, genero: 'M', ministerio: '', nivel_academico: '', ocupacion: '', cedula: '' })
      setFieldErrors({})
      onCreated && onCreated()
    } catch (err) {
      // Map backend duplicate key errors to field-specific messages
      const api = err && err.payload ? err.payload : null
      if (api && Array.isArray(api.errors)) {
        const dupFieldErrors = {}
        for (const item of api.errors) {
          const field = item?.field
          const message = item?.message || 'Valor ya registrado.'
          if (field === 'cedula' || field === 'email') {
            dupFieldErrors[field] = message
          }
        }
        if (Object.keys(dupFieldErrors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...dupFieldErrors }))
        }
      }
      setError((api && api.message) || err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const edad = getAgeFromDate(form.fecha_nacimiento)

  return (
    <form onSubmit={onSubmit} className="p-fluid sm-form" style={{ maxWidth: 980, margin: '0 auto' }}>
      <Toast ref={toastRef} position="bottom-right" className="toast-clean" />
      {/* Welcome overlay + confetti canvas */}
      {showWelcome && (
        <div className="welcome-overlay" onClick={() => setShowWelcome(false)}>
          <canvas ref={confettiRef} className="welcome-canvas" />
          <div className="welcome-card">
            <h2>¡Bienvenid@{welcomeName ? (`, ${welcomeName}`) : ''}!</h2>
            <p className="welcome-sub">al ministerio Jovenes con Proposito 🎉</p>
          </div>
        </div>
      )}
      <div className="formgrid grid">
        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText
              id="nombre"
              required
              className={`p-inputtext-sm ${fieldErrors.nombre ? 'p-invalid' : ''}`}
              value={form.nombre}
              onChange={(e) => onChange(e, 'nombre')}
              onBlur={() => setFieldErrors(prev => ({ ...prev, nombre: validateNombre(form.nombre) }))}
              aria-describedby="nombre-help"
            />
            <label htmlFor="nombre">Nombre</label>
          </span>
          {fieldErrors.nombre && <small id="nombre-help" className="p-error">{fieldErrors.nombre}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText
              id="apellido"
              required
              className={`p-inputtext-sm ${fieldErrors.apellido ? 'p-invalid' : ''}`}
              value={form.apellido}
              onChange={(e) => onChange(e, 'apellido')}
              onBlur={() => setFieldErrors(prev => ({ ...prev, apellido: validateApellido(form.apellido) }))}
              aria-describedby="apellido-help"
            />
            <label htmlFor="apellido">Apellido</label>
          </span>
          {fieldErrors.apellido && <small id="apellido-help" className="p-error">{fieldErrors.apellido}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText id="email" className={`p-inputtext-sm ${fieldErrors.email ? 'p-invalid' : ''}`} value={form.email} onChange={(e) => onChange(e, 'email')} onBlur={() => setFieldErrors(prev => ({ ...prev, email: validateEmail(form.email) }))} aria-describedby="email-help" />
            <label htmlFor="email">Email</label>
          </span>
          {fieldErrors.email && <small id="email-help" className="p-error">{fieldErrors.email}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText 
              id="telefono" 
              ref={telRef}
              className={`p-inputtext-sm ${fieldErrors.telefono ? 'p-invalid' : ''}`} 
              value={formatPhoneDisplay(form.telefono)} 
              onChange={onPhoneChange} 
              onBlur={() => setFieldErrors(prev => ({ ...prev, telefono: form.telefono && form.telefono.length !== 10 ? 'Teléfono debe tener 10 dígitos' : '' }))} 
              aria-describedby="tel-help" 
              inputMode="numeric" 
              autoComplete="off" 
            />
            <label htmlFor="telefono">Teléfono</label>
          </span>
          {fieldErrors.telefono && <small id="tel-help" className="p-error">{fieldErrors.telefono}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label" style={{ position: 'relative', display: 'block' }}>
            <Calendar
              inputId="fecha_nacimiento"
              id="fecha_nacimiento"
              inputClassName={`p-inputtext-sm ${fieldErrors.fecha_nacimiento ? 'p-invalid' : ''}`}
              inputStyle={{ paddingRight: edad != null ? '5rem' : undefined }}
              value={form.fecha_nacimiento}
              onChange={(e) => onChange(e.value, 'fecha_nacimiento')}
              onBlur={() => setFieldErrors(prev => ({ ...prev, fecha_nacimiento: validateFechaNacimiento(form.fecha_nacimiento) }))}
              dateFormat="yy-mm-dd"
              showIcon
            />
            <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
            {edad != null && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '2.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-color-secondary, #6b7280)',
                  pointerEvents: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Edad: {edad}
              </span>
            )}
          </span>
          {fieldErrors.fecha_nacimiento && <small id="fecha-help" className="p-error">{fieldErrors.fecha_nacimiento}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <Dropdown inputId="genero" className="p-inputtext-sm" value={form.genero} options={[{ label: 'M', value: 'M' }, { label: 'F', value: 'F' }]} onChange={(e) => onChange(e.value, 'genero')} />
            <label htmlFor="genero">Género</label>
          </span>
        </div>

        <div className="field col-12 sm:col-6 mb-3">
            <span className="p-float-label">
                <InputText 
                id="cedula" 
                className={`p-inputtext-sm ${fieldErrors.cedula ? 'p-invalid' : ''}`} 
                value={formatCedulaDisplay(form.cedula)} 
                onChange={onCedulaChange} 
                aria-describedby="ced-help" 
                inputMode="numeric" 
                autoComplete="off" 
                />
                <label htmlFor="cedula">Cédula</label>
            </span>
            {fieldErrors.cedula && <small id="ced-help" className="p-error">{fieldErrors.cedula}</small>}
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText id="ministerio" className="p-inputtext-sm" value={form.ministerio} onChange={(e) => onChange(e, 'ministerio')} />
            <label htmlFor="ministerio">Ministerio</label>
          </span>
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText id="nivel_academico" className="p-inputtext-sm" value={form.nivel_academico} onChange={(e) => onChange(e, 'nivel_academico')} />
            <label htmlFor="nivel_academico">Nivel académico</label>
          </span>
        </div>

        <div className="field col-12 sm:col-6 mb-3">
          <span className="p-float-label">
            <InputText id="ocupacion" className="p-inputtext-sm" value={form.ocupacion} onChange={(e) => onChange(e, 'ocupacion')} />
            <label htmlFor="ocupacion">Ocupación</label>
          </span>
        </div>

        <div className="field col-12 sm:col-6 flex align-items-center mb-3">
          <Checkbox inputId="bautizado" checked={form.bautizado} onChange={(e) => onCheckboxChange(e, 'bautizado')} />
          <label htmlFor="bautizado" className="ml-2">Bautizado</label>
        </div>

        <div className="col-12" style={{ textAlign: 'center' }}>
          <Button 
            type="submit" 
            label="Registrar Joven" 
            className="p-mt-2 p-button-secondary" 
            loading={loading} 
            disabled={!isSundayToday || loading}
            title={!isSundayToday ? 'Disponible solo los domingos' : undefined}
          />
        </div>
      </div>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  )
}

// Confetti effect: attach to overlay canvas when mounted
export function startConfetti(canvas) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpi = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpi
  canvas.height = h * dpi
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx.scale(dpi, dpi)

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6']
  const particles = []
  const count = 80
  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h / 2 + (Math.random() - 0.7) * 40,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 1.5) * 8,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 80 + Math.floor(Math.random() * 40)
    })
  }

  let frame = 0
  function tick() {
    frame++
    ctx.clearRect(0, 0, w, h)
    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.25 // gravity
      p.vx *= 0.99
      p.life--
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.7, Math.PI * 2 * Math.random(), 0, Math.PI * 2)
      ctx.fill()
    })
    if (frame < 180) requestAnimationFrame(tick)
    else ctx.clearRect(0, 0, w, h)
  }
  tick()
}
