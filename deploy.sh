git pull

sudo chown -R $USER:$USER /mnt

if ! docker ps --format '{{.Names}}' | grep -qE 'mediaj3rzydev_nextjs_1|mediaj3rzydev_db_1'; then
  docker-compose up -d
else
  docker-compose build nextjs
  docker-compose up -d nextjs
fi

docker system prune -f