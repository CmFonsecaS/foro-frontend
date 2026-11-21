import { Categoria, Comentario, Publicacion, Usuario } from '../models/modelos';

/**
 * Datos iniciales de la aplicación manejados como ARREGLOS de Angular.
 * En esta evaluación el FrontEnd funciona de forma independiente del BackEnd,
 * por lo que la información se obtiene de estas colecciones estáticas.
 */

export const PASSWORD_DEMO = 'DemoForo2026!';

export const USUARIOS_INICIALES: Usuario[] = [
  {
    id: 1,
    nombre: 'Administrador Foro',
    email: 'admin@foro.test',
    password: PASSWORD_DEMO,
    rol: 'ADMIN',
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-01T09:00:00',
    bio: 'Cuenta oficial de administración de Ágora.',
    ciudad: 'Santiago',
  },
  {
    id: 2,
    nombre: 'Ana García',
    email: 'ana@foro.test',
    password: PASSWORD_DEMO,
    rol: 'USUARIO',
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-03T11:20:00',
    bio: 'Fan de la tecnología y los videojuegos de estrategia.',
    ciudad: 'Valparaíso',
    fechaNacimiento: '1999-04-12',
  },
  {
    id: 3,
    nombre: 'Carlos Pérez',
    email: 'carlos@foro.test',
    password: PASSWORD_DEMO,
    rol: 'USUARIO',
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-04T16:45:00',
    bio: 'Desarrollador Java en formación.',
    ciudad: 'Concepción',
    fechaNacimiento: '2001-08-30',
  },
  {
    id: 4,
    nombre: 'Moderadora Foro',
    email: 'moderador@foro.test',
    password: PASSWORD_DEMO,
    rol: 'MODERADOR',
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-05T10:00:00',
    bio: 'Velo por que se respeten las normas de la comunidad.',
    ciudad: 'Santiago',
  },
  {
    id: 5,
    nombre: 'Diego Rojas',
    email: 'diego@foro.test',
    password: PASSWORD_DEMO,
    rol: 'USUARIO',
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-08T19:10:00',
    bio: 'Profesor de ciencias y divulgador.',
    ciudad: 'La Serena',
  },
  {
    id: 6,
    nombre: 'Usuario Suspendido',
    email: 'suspendido@foro.test',
    password: PASSWORD_DEMO,
    rol: 'USUARIO',
    estado: 'INACTIVO',
    fechaCreacion: '2026-10-10T08:30:00',
  },
];

export const CATEGORIAS_INICIALES: Categoria[] = [
  {
    id: 1,
    nombre: 'Tecnología',
    descripcion: 'Noticias y debates sobre tecnología, gadgets e inteligencia artificial.',
    icono: 'bi-cpu',
    color: '#2563eb',
  },
  {
    id: 2,
    nombre: 'Programación',
    descripcion: 'Consultas sobre lenguajes, frameworks y desarrollo de software.',
    icono: 'bi-code-slash',
    color: '#0f766e',
  },
  {
    id: 3,
    nombre: 'Videojuegos',
    descripcion: 'Discusiones sobre videojuegos, plataformas y e-sports.',
    icono: 'bi-controller',
    color: '#7c3aed',
  },
  {
    id: 4,
    nombre: 'Educación',
    descripcion: 'Recursos de aprendizaje y experiencias educativas.',
    icono: 'bi-mortarboard',
    color: '#c2410c',
  },
  {
    id: 5,
    nombre: 'Ciencia',
    descripcion: 'Noticias, descubrimientos científicos y divulgación.',
    icono: 'bi-rocket-takeoff',
    color: '#be123c',
  },
  {
    id: 6,
    nombre: 'Cine y Series',
    descripcion: 'Estrenos, reseñas y recomendaciones de cine y series.',
    icono: 'bi-film',
    color: '#a16207',
  },
];

export const PUBLICACIONES_INICIALES: Publicacion[] = [
  {
    id: 1,
    titulo: 'Bienvenidos al foro de tecnologia',
    contenido:
      'Este espacio permite compartir noticias y experiencias sobre tecnología. ' +
      'Preséntate y cuéntanos qué temas te interesan: inteligencia artificial, hardware, móviles o redes.',
    idUsuario: 2,
    idCategoria: 1,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-12T10:15:00',
    etiquetas: ['bienvenida', 'comunidad'],
    vistas: 128,
  },
  {
    id: 2,
    titulo: 'Primeros pasos con Java',
    contenido:
      'Compartamos recomendaciones para aprender Java y Spring Boot. ' +
      '¿Qué libros, cursos o proyectos les sirvieron para empezar con microservicios?',
    idUsuario: 3,
    idCategoria: 2,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-13T18:40:00',
    etiquetas: ['java', 'spring-boot'],
    vistas: 96,
  },
  {
    id: 3,
    titulo: 'Videojuegos favoritos',
    contenido:
      '¿Cuáles son sus videojuegos favoritos y por qué los recomiendan? ' +
      'Yo parto con los juegos de estrategia por turnos.',
    idUsuario: 2,
    idCategoria: 3,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-15T21:05:00',
    etiquetas: ['recomendaciones'],
    vistas: 210,
  },
  {
    id: 4,
    titulo: 'Angular vs React en 2026',
    contenido:
      'Estoy por comenzar un proyecto FullStack y dudo entre Angular y React para el FrontEnd. ' +
      '¿Qué ventajas ven en el uso de signals y componentes standalone de Angular?',
    idUsuario: 5,
    idCategoria: 2,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-20T09:30:00',
    etiquetas: ['angular', 'frontend'],
    vistas: 154,
  },
  {
    id: 5,
    titulo: 'Técnicas de estudio que sí funcionan',
    contenido:
      'La práctica espaciada y la recuperación activa me ayudaron mucho este semestre. ' +
      '¿Qué técnicas usan ustedes para preparar evaluaciones?',
    idUsuario: 5,
    idCategoria: 4,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-22T14:00:00',
    etiquetas: ['estudio', 'productividad'],
    vistas: 77,
  },
  {
    id: 6,
    titulo: 'El telescopio James Webb y los exoplanetas',
    contenido:
      'Las últimas observaciones detectaron moléculas interesantes en atmósferas de exoplanetas. ' +
      'Comparto un resumen y abro el debate sobre lo que significa para la búsqueda de vida.',
    idUsuario: 5,
    idCategoria: 5,
    estado: 'ACTIVO',
    fechaCreacion: '2026-10-25T20:10:00',
    etiquetas: ['astronomía', 'divulgación'],
    vistas: 189,
  },
  {
    id: 7,
    titulo: 'Series recomendadas para este verano',
    contenido:
      'Busco series de ciencia ficción o misterio para ver en vacaciones. ' +
      'Dejen sus recomendaciones sin spoilers, por favor.',
    idUsuario: 3,
    idCategoria: 6,
    estado: 'ACTIVO',
    fechaCreacion: '2026-11-02T22:00:00',
    etiquetas: ['series', 'recomendaciones'],
    vistas: 64,
  },
  {
    id: 8,
    titulo: 'Gana dinero fácil con este enlace',
    contenido: 'Promoción sospechosa con enlaces externos. Este tema incumple las normas del foro.',
    idUsuario: 6,
    idCategoria: 1,
    estado: 'BANEADO',
    fechaCreacion: '2026-11-03T03:12:00',
    motivoBaneo: 'Spam y publicidad no autorizada.',
    etiquetas: ['spam'],
    vistas: 12,
  },
  {
    id: 9,
    titulo: '¿Vale la pena Docker para proyectos pequeños?',
    contenido:
      'Para un proyecto universitario con dos microservicios y un FrontEnd en Angular, ' +
      '¿recomiendan Docker desde el inicio o solo para el despliegue en la nube?',
    idUsuario: 2,
    idCategoria: 2,
    estado: 'ACTIVO',
    fechaCreacion: '2026-11-10T12:25:00',
    etiquetas: ['docker', 'cloud'],
    vistas: 88,
  },
];

export const COMENTARIOS_INICIALES: Comentario[] = [
  { id: 1, contenido: 'Excelente iniciativa para compartir conocimientos.', idPublicacion: 1, idUsuario: 3, estado: 'ACTIVO', fechaCreacion: '2026-10-12T12:00:00' },
  { id: 2, contenido: 'Recomiendo comenzar con programación orientada a objetos.', idPublicacion: 2, idUsuario: 2, estado: 'ACTIVO', fechaCreacion: '2026-10-13T19:10:00' },
  { id: 3, contenido: 'Me gustan los videojuegos MMORPG como el WOW.', idPublicacion: 3, idUsuario: 3, estado: 'ACTIVO', fechaCreacion: '2026-10-15T22:00:00' },
  { id: 4, contenido: 'Angular trae todo integrado: router, formularios y HttpClient. Para equipos grandes es muy ordenado.', idPublicacion: 4, idUsuario: 3, estado: 'ACTIVO', fechaCreacion: '2026-10-20T11:00:00' },
  { id: 5, contenido: 'Los signals simplificaron mucho mi código, lo recomiendo.', idPublicacion: 4, idUsuario: 2, estado: 'ACTIVO', fechaCreacion: '2026-10-20T13:45:00' },
  { id: 6, contenido: 'La técnica Pomodoro también me sirve para no distraerme.', idPublicacion: 5, idUsuario: 2, estado: 'ACTIVO', fechaCreacion: '2026-10-22T16:20:00' },
  { id: 7, contenido: 'Comentario con insultos hacia otros usuarios.', idPublicacion: 3, idUsuario: 6, estado: 'BANEADO', fechaCreacion: '2026-10-16T01:30:00', motivoBaneo: 'Lenguaje ofensivo.' },
  { id: 8, contenido: '¡Muy buen resumen! Esperemos más datos en los próximos meses.', idPublicacion: 6, idUsuario: 3, estado: 'ACTIVO', fechaCreacion: '2026-10-26T09:00:00' },
  { id: 9, contenido: 'Sí, Docker te evita el clásico "en mi máquina funciona".', idPublicacion: 9, idUsuario: 5, estado: 'ACTIVO', fechaCreacion: '2026-11-10T14:00:00' },
];
