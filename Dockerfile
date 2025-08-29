# Base: Node LTS Debian slim (mais fácil para módulos nativos)
FROM node:20-slim

# Diretório de trabalho
WORKDIR /usr/src/app

# Instalar dependências de build
RUN apt-get update && apt-get install -y python3 make g++ bash && rm -rf /var/lib/apt/lists/*

# Copiar package.json e yarn.lock
COPY package.json yarn.lock ./

# Instalar dependências, recompilando módulos nativos (better-sqlite3)
RUN yarn install --frozen-lockfile --build-from-source better-sqlite3

# Copiar o restante do código
COPY . .

# Compilar TypeScript
RUN npx tsc

# Expor porta 80
EXPOSE 80
ENV PORT=80

# Comando para rodar a API
CMD ["node", "dist/index.js"]