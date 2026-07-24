FROM ghcr.io/foundry-rs/foundry:latest

ARG FORK_URL=https://eth.drpc.org
ARG FORK_BLOCK=24000000
ENV FORK_URL=${FORK_URL} FORK_BLOCK=${FORK_BLOCK} EXTRA_ARGS=""

USER root
COPY prewarm.sh /prewarm.sh
COPY entrypoint.sh /entrypoint.sh
# Bake the fork state used by tasks into the image so trials skip the upstream RPC.
RUN sh /prewarm.sh && chmod +x /entrypoint.sh

EXPOSE 8545
ENTRYPOINT []
CMD ["/bin/sh", "/entrypoint.sh"]
