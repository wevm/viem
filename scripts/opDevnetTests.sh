#!/bin/bash

# We are cloning the optimis repo into .OPTIMISM
# This is a temporary solution until we can fork a live network
OPTIMISM_DIR=.optimism

if ! [[ -d ${OPTIMISM_DIR}  ]]; then
  echo "cloning ${OPTIMISM_DIR}"
  git clone git@github.com:ethereum-optimism/optimism.git ${OPTIMISM_DIR} || { echo 'Unable to clone optimism' ; exit 1; }
  echo "cloning ${OPTIMISM_DIR} successful"
fi

echo "starting devnet..."
cd ${OPTIMISM_DIR}
pnpm && pnpm build && make devnet-up || { echo 'unable to start devnet' ; exit 1; }
cd ..

echo "Running tests against optimism devnet..."
OP_DEVNET=true CI=true vitest -c ./test/vitest.op.config.ts --coverage --retry=3 --bail=1 --pool=forks
