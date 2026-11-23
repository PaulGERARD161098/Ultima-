FROM node:22-alpine

WORKDIR /app

# Dépendances de production uniquement, sans scripts postinstall arbitraires.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Code strictement nécessaire au runtime API de Léo (aucun dossier privé ni doc).
COPY api ./api
COPY js/leo-interaction.mjs ./js/leo-interaction.mjs
COPY deploy/hostinger/server.mjs ./deploy/hostinger/server.mjs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "deploy/hostinger/server.mjs"]
