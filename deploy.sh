git pull

uploads_dir=$(grep -A 6 'uploads_data:' docker-compose.yml | grep 'device:' | sed 's/.*device: //')

if [ -n "$uploads_dir" ]; then
  if [ -d "$uploads_dir" ]; then
    if [ ! -r "$uploads_dir" ] || [ ! -w "$uploads_dir" ]; then
      sudo chmod u+rw "$uploads_dir"
    fi
  else
    if ! mkdir -p "$uploads_dir"; then
      sudo mkdir -p "$uploads_dir"
    fi
  fi
fi

if ! docker ps --format '{{.Names}}' | grep -qE 'mediaj3rzydev_nextjs_1|mediaj3rzydev_db_1'; then
  docker-compose up -d
else
  docker-compose build nextjs
  docker-compose up -d nextjs
fi

docker system prune -f