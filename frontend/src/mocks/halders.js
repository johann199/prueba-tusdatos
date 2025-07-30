import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock para el login
  http.post('http://localhost:8000/api/auth/login', async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({ access_token: 'mock_token', token_type: 'bearer' }, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Correo o contraseña incorrectos' }, { status: 401 });
  }),

  // Mock para obtener eventos
  http.get('http://localhost:8000/api/eventos/', () => {
    return HttpResponse.json([
      {
        id: 1,
        titulo: 'Evento de Prueba 1',
        descripcion: 'Descripción del evento 1',
        fecha_inicio: '2025-08-01T10:00:00Z',
        fecha_fin: '2025-08-01T18:00:00Z',
        lugar: 'Virtual',
        capacidad: 100,
        registrado: 50,
        estado: 'ACTIVO',
        creado: '2025-07-20T09:00:00Z',
        modificado: '2025-07-20T09:00:00Z',
        creador: { id: 1, nombre: 'Creador Test' }
      },
      {
        id: 2,
        titulo: 'Evento de Prueba 2',
        descripcion: 'Descripción del evento 2',
        fecha_inicio: '2025-09-10T14:00:00Z',
        fecha_fin: '2025-09-10T20:00:00Z',
        lugar: 'Presencial',
        capacidad: 200,
        registrado: 10,
        estado: 'PENDIENTE',
        creado: '2025-07-25T11:00:00Z',
        modificado: '2025-07-25T11:00:00Z',
        creador: { id: 2, nombre: 'Otro Creador' }
      }
    ], { status: 200 });
  }),

  // Mock para obtener detalles de un evento (para EventDetailsModal)
  http.get('http://localhost:8000/api/eventos/:id', ({ params }) => {
    const { id } = params;
    if (id === '1') {
      return HttpResponse.json({
        id: 1,
        titulo: 'Evento de Prueba 1 (Detallado)',
        descripcion: 'Descripción completa del evento 1 con más detalles.',
        fecha_inicio: '2025-08-01T10:00:00Z',
        fecha_fin: '2025-08-01T18:00:00Z',
        lugar: 'Virtual (Zoom)',
        capacidad: 100,
        registrado: 50,
        estado: 'ACTIVO',
        creado: '2025-07-20T09:00:00Z',
        modificado: '2025-07-20T09:00:00Z',
        creador: { id: 1, nombre: 'Creador Detallado' },
        sesiones: [
          { id: 101, titulo: 'Sesión A', fecha_inicio: '2025-08-01T10:30:00Z', fecha_fin: '2025-08-01T11:30:00Z', nombre_orador: 'Orador 1', evento_id: 1 }
        ]
      }, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Evento no encontrado' }, { status: 404 });
  }),

  // Mock para registrarse en un evento
  http.post('http://localhost:8000/api/eventos/:id/register', ({ params }) => {
    const { id } = params;
    if (id === '1') {
      // Simula un registro exitoso
      return HttpResponse.json({
        id: 1001,
        user: { id: 3, nombre: 'Usuario Registrado' },
        evento: { id: 1, titulo: 'Evento de Prueba 1' },
        registrado_en: '2025-07-30T10:00:00Z',
        confirmado: true
      }, { status: 201 });
    }
    // Simula un error (ej. ya registrado)
    return HttpResponse.json({ detail: 'Ya estás registrado en este evento' }, { status: 409 });
  }),
];
