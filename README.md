```bash
sudo chown -R $USER:$USER /mnt
docker-compose up -d
```
`.env` (Production):
```dotenv
AUTH_SECRET=
AUTH_DISCORD_ID=
AUTH_DISCORD_SECRET=
NEXTAUTH_URL=
POSTGRES_USER=
POSTGRES_PASSWORD=
```
`.env` (Development):
```dotenv
DATABASE_URL=
AUTH_SECRET=
AUTH_DISCORD_ID=
AUTH_DISCORD_SECRET=
NEXTAUTH_URL=http://localhost:3000
```