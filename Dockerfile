FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb package.json ./

RUN bun install

COPY . .

RUN bun prisma generate

RUN bun run build

RUN addgroup --system --gid 1001 postgres

EXPOSE 3000

CMD ["bun", "run", "start"]