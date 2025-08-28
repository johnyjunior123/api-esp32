# Use Node LTS leve
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copiar todo o código
COPY . .

# Compilar TypeScript
RUN npx tsc

# Expõe porta 80
EXPOSE 80

# Variáveis de ambiente padrão
ENV PORT=80

# Comando para rodar a API
CMD ["node", "dist/index.js"]