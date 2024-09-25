#!/usr/bin/env bash

git pull --rebase

check_uploads_dir()
{
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
}

check_dot_env()
{
  if [ ! -f '.env' ]; then
    touch .env
    {
      echo "AUTH_SECRET=$(openssl rand -base64 33)"
      echo 'NEXTAUTH_URL='
      echo 'POSTGRES_USER='
      echo 'POSTGRES_PASSWORD='
    } >> .env
    if [ -f 'auth.config.ts' ]; then
      auth_providers=$(grep 'providers:' auth.config.ts | sed 's/.*providers: //' | sed 's/,$//' | sed 's/\[//;s/\]//;')
      IFS=',' read -ra auth_providers_array <<< "$auth_providers"
      for provider in "${auth_providers_array[@]}"; do
        provider=$(echo "$provider" | xargs)
        uppercase_provider=$(echo "$provider" | tr '[:lower:]' '[:upper:]')
        echo "AUTH_${uppercase_provider}_ID="
        echo "AUTH_${uppercase_provider}_SECRET="
      done >> .env
    fi
    echo 'Fill in the .env file with the necessary environment variables.'
    exit 1
  else
    while IFS= read -r line; do
      if [[ "$line" =~ ^#.* ]] || [[ -z "$line" ]]; then
        continue
      fi
      IFS='=' read -r key value <<< "$line"
      if [[ -z "$value" ]]; then
        echo "The value for the $key variable is missing."
        exit 1
      fi
    done < '.env'
  fi
}

check_docker()
{
  if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    if command -v apt >/dev/null 2>&1; then
      sudo apt update -y
      sudo apt install docker docker-compose -y
    elif command -v dnf >/dev/null 2>&1; then
      sudo dnf check-update -y
      sudo dnf install docker docker-compose -y
    elif command -v pacman >/dev/null 2>&1; then
      sudo pacman -Syu docker docker-compose --noconfirm
    else
      echo 'Please install Docker and Docker Compose.'
      exit 1
    fi
  fi
}

check_uploads_dir
check_dot_env
check_docker

if ! docker ps --format '{{.Names}}' | grep -qE 'mediaj3rzydev_nextjs_1|mediaj3rzydev_db_1'; then
  docker-compose up -d
else
  docker-compose build nextjs
  docker-compose up -d nextjs
fi

docker system prune -f