# Ágora — Frontend del Sistema de Foros en Línea

Aplicación web del **Sistema de Foros en Línea** (Desarrollo Full Stack III — Duoc UC), construida con **Angular 22** y **Bootstrap 5**.

Ágora permite a la comunidad buscar, leer, publicar y comentar temas organizados por categorías, con un panel de moderación y uno de administración según el rol del usuario.

## Tecnologías

- Angular 22 (componentes standalone, signals, control flow `@if` / `@for`, lazy loading)
- Bootstrap 5.3 (grilla de 12 columnas) y Bootstrap Icons
- Formularios reactivos con validaciones HTML + validadores personalizados de Angular
- Docker (Nginx sin privilegios) y despliegue en AWS EC2 mediante GitHub Actions

## Roles

| Rol | Puede |
|---|---|
| **Usuario** | Registrarse, iniciar sesión, editar su perfil y contraseña, buscar, publicar, editar y eliminar sus temas, comentar |
| **Moderador** | Todo lo anterior + banear y reactivar temas y comentarios (panel de moderación) |
| **Administrador** | Todo lo anterior + gestionar usuarios (rol, activar/desactivar, eliminar) y el CRUD de categorías |

Cuentas de demostración (contraseña `DemoForo2026!`): `admin@foro.test`, `moderador@foro.test`, `ana@foro.test`.

## Pantallas

- **Acceso:** inicio de sesión, registro, recuperar contraseña (3 pasos con código de verificación), modificación de perfil.
- **Foro:** inicio, categorías, temas por categoría, búsqueda con filtros y paginación, detalle de tema con comentarios, publicar/editar tema, mis publicaciones, normas de la comunidad.
- **Gestión:** panel de moderación, administración (resumen, usuarios, categorías), página 404.

## Validaciones

- Atributos HTML (`required`, `minlength`, `maxlength`, `type="email"`, `pattern`, `max`) y validadores de Angular.
- Contraseña segura (7 reglas con indicador en vivo): 8 a 20 caracteres, mayúscula, minúscula, número, carácter especial y sin espacios.
- Validadores propios: correo válido y no repetido, confirmación de contraseña, edad mínima de 13 años, nombres solo con letras, campos sin solo espacios, etiquetas válidas, nombres de categoría únicos.
- Bloqueo temporal tras 5 intentos de inicio de sesión fallidos.

## Patrones de diseño

- **MVC por componentes:** plantilla (vista), componente (controlador) y servicios/modelos (modelo).
- **Repository genérico:** `RepositorioLocal<T>` encapsula el acceso a las colecciones (arreglos en memoria persistidos en `localStorage`).
- **Singleton:** servicios `providedIn: 'root'` (`AuthService`, `ForoService`, `UsuarioService`, `CategoriaService`).
- **Observer:** estado reactivo con signals y `computed`.
- **Guards** de ruta para autenticación y autorización por rol.

> Los datos se manejan con arreglos/listas en el frontend (no requiere conexión al backend). Los microservicios equivalentes son `usuarios-service`, `foro-service` y `administracion-service`.

## Diseño responsivo

Probado en tres tamaños: móvil (< 576 px), tablet (576–991 px) y escritorio (≥ 992 px), usando la grilla de Bootstrap (`col-12 col-md-6 col-lg-4`, etc.) y media queries propias en `src/styles.css`.

## Estructura

```
src/app
├── core
│   ├── data          # datos iniciales (arreglos)
│   ├── guards        # authGuard, rolGuard, invitadoGuard
│   ├── models        # interfaces y roles
│   ├── services      # lógica de negocio y repositorio genérico
│   └── validators    # validadores personalizados
├── layout            # barra de navegación y pie de página
├── pages
│   ├── auth          # login, registro, recuperar, perfil
│   ├── foro          # inicio, categorías, explorar, detalle, formulario, mis publicaciones, normas
│   └── admin         # moderación y administración
└── shared            # componentes reutilizables (tarjetas, modal, toasts, errores de campo)
```

## Ejecución local

```bash
npm install
npm start            # http://localhost:4200
npm run build        # compilación de producción en dist/
```

Con Docker:

```bash
docker build -t foro-frontend .
docker run -p 4000:4000 foro-frontend   # http://localhost:4000
```

## Despliegue en AWS (EC2)

- `ec2/foro-online-ec2-stack.yml`: stack de CloudFormation que crea la instancia EC2 (Docker + Nginx como proxy inverso), el grupo de seguridad y el bucket S3 privado para el wallet de Oracle.
- `.github/workflows/publish-ecr.yml`: compila, publica la imagen en Amazon ECR (`foro-online/foro-frontend`) y la despliega en la EC2 mediante AWS Systems Manager.
- `ec2/deploy-frontend.sh`: reemplaza el contenedor en la EC2 con verificación de salud y rollback.

Nginx en la EC2 enruta:

| Ruta | Destino |
|---|---|
| `/api/auth`, `/api/usuarios` | usuarios-service (8081) |
| `/api/categorias`, `/api/publicaciones`, `/api/comentarios` | administracion-service (8082) |
| `/api/foro` | foro-service (8083) |
| `/` | frontend (4000) |

Secretos del repositorio: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`. Variables: `AWS_REGION`, `EC2_INSTANCE_ID`.
