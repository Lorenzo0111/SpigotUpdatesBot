# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

LABEL org.opencontainers.image.source=https://github.com/Lorenzo0111/SpigotUpdatesBot

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lockb prisma/ /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --chown=bun --from=install /temp/prod/node_modules node_modules
COPY --chown=bun --from=prerelease /usr/src/app/ .

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]