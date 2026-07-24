FROM node:22-bookworm-slim

# bash is required by Harbor's docker environment; curl/git for agent installers.
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates curl git procps ripgrep \
  && rm -rf /var/lib/apt/lists/*

COPY viem.tgz /opt/viem-3.0.0.tgz

# Fixture template; tasks overlay their own files on top of /app.
WORKDIR /app
COPY template/package.json /app/package.json
RUN npm install && npm cache clean --force
