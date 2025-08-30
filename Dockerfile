# Base: Node LTS Debian slim
FROM node:20-slim

WORKDIR /usr/src/app

# Copiar apenas manifests primeiro
COPY package.json yarn.lock ./

# Instalar dependências (compila better-sqlite3 no Linux)
RUN yarn

# Agora sim copiar código
COPY . .

# Compilar TS
RUN npx tsc

EXPOSE 80
ENV PORT=80

CMD ["node", "dist/index.js"]