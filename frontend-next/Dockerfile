# ---------- Build stage ----------
FROM node:20-bullseye AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --unsafe-perm

# Copy source and build Next.js
COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:20-bullseye AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
