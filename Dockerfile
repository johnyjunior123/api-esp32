# Base: Node LTS Debian slim (tem Python e build tools)
FROM node:20-slim

# Diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e yarn.lock
COPY package.json yarn.lock ./

# Instalar dependências e recompilar módulos nativos
RUN yarn install --frozen-lockfile --build-from-source

# Copiar o restante do código
COPY . .

# Compilar TypeScript
RUN npx tsc

# Expor porta
EXPOSE 80
ENV PORT=80

# Comando para rodar a API
CMD ["node", "dist/index.js"]
