FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base as prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun prisma generate
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/build .
COPY --from=prerelease /app/package.json .

COPY --from=prerelease /app/prisma prisma
COPY ./static static

RUN chown -R bun:bun /app

RUN bun prisma generate

USER bun
EXPOSE 3000
CMD ["bun", "index.js"]