const API_BASE = 'https://backend01-proyecto-jovenes-phru.vercel.app'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText)
    err.status = res.status
    err.payload = data
    throw err
  }

  return data
}

export function getPersonas({ cedula, nombreCompleto, currentPage, limit } = {}) {
  const params = new URLSearchParams()
  if (cedula) params.set('cedula', cedula)
  if (nombreCompleto) params.set('nombreCompleto', nombreCompleto)
  if (currentPage) params.set('currentPage', String(currentPage))
  if (limit) params.set('limit', String(limit))

  const qp = params.toString()
  return request(`/personas${qp ? `?${qp}` : ''}`)
}

export function createPersona(payload) {
  return request('/personas', { method: 'POST', body: JSON.stringify(payload) })
}

export function getActividades() {
  return request('/actividades')
}

export function createActividad(payload) {
  return request('/actividades', { method: 'POST', body: JSON.stringify(payload) })
}

export function getActividadesSemana({ fecha } = {}) {
  const params = new URLSearchParams()
  if (fecha) params.set('fecha', fecha)
  const qp = params.toString()
  return request(`/actividades/semana${qp ? `?${qp}` : ''}`)
}

export function asistirActividad(id, personaId) {
  if (!id) throw new Error('Clase id requerido')
  if (!personaId) throw new Error('personaId requerido')
  return request(`/actividades/${id}/asistir`, { method: 'POST', body: JSON.stringify({ personaId }) })
}

export default { getPersonas, createPersona, getActividades, createActividad, getActividadesSemana, asistirActividad }
