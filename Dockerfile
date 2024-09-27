FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN addgroup --system --gid 1001 postgres

EXPOSE 3000

CMD ["npm", "run", "start"]