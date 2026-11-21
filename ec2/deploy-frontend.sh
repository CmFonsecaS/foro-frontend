#!/usr/bin/env bash
# =====================================================
# Se ejecuta DENTRO de la EC2 (vía AWS Systems Manager).
# Descarga la imagen del frontend desde ECR y reemplaza
# el contenedor "foro-frontend" (puerto 4000, detrás de Nginx).
# Si el nuevo contenedor no responde, restaura el anterior.
# =====================================================
set -Eeuo pipefail

image="${1:?URI de la imagen requerida}"
region="${2:?region requerida}"
name=foro-frontend
port=4000

if [[ ! "$image" =~ ^[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com/[a-z0-9._/-]+:[A-Za-z0-9._-]+$ ]]; then
  echo "URI de imagen ECR invalida." >&2
  exit 2
fi
if [[ ! "$region" =~ ^[a-z0-9-]+$ ]]; then
  echo "Region invalida." >&2
  exit 2
fi

registry="${image%%/*}"
docker_config="$(mktemp -d /tmp/foro-ecr.XXXXXX)"
export DOCKER_CONFIG="$docker_config"
cleanup() { rm -rf -- "$docker_config"; }
trap cleanup EXIT

aws ecr get-login-password --region "$region" \
  | docker login --username AWS --password-stdin "$registry" >/dev/null
docker pull "$image"
docker logout "$registry" >/dev/null 2>&1 || true

backup=""
nuevo=false
rollback() {
  status=$?
  trap - EXIT
  if (( status != 0 )); then
    if [[ "$nuevo" == true ]]; then
      docker logs --tail 50 "$name" 2>&1 || true
      docker rm -f "$name" >/dev/null 2>&1 || true
    fi
    if [[ -n "$backup" ]] && docker inspect "$backup" >/dev/null 2>&1; then
      docker rename "$backup" "$name"
      docker start "$name" >/dev/null
      echo "Despliegue fallido: se restauro el contenedor anterior." >&2
    fi
  fi
  cleanup
  exit "$status"
}
trap rollback EXIT

if docker inspect "$name" >/dev/null 2>&1; then
  backup="${name}-respaldo-$(date +%s)"
  docker rename "$name" "$backup"
  docker stop "$backup" >/dev/null || true
fi

nuevo=true
docker run -d \
  --name "$name" \
  --restart unless-stopped \
  --publish "127.0.0.1:${port}:${port}" \
  "$image" >/dev/null

sano=false
for intento in $(seq 1 30); do
  if curl --fail --silent --max-time 5 "http://127.0.0.1:${port}/" >/dev/null; then
    sano=true
    break
  fi
  sleep 2
done
if [[ "$sano" != true ]]; then
  echo "El frontend no respondio en el puerto ${port}." >&2
  exit 1
fi

if [[ -n "$backup" ]]; then
  docker rm "$backup" >/dev/null
fi
backup=""
docker image prune -f >/dev/null 2>&1 || true
trap - EXIT
cleanup
echo "Frontend desplegado correctamente: ${image}"
