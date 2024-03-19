import fs from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'url'
import { execaCommand } from 'execa'

const OPTIMISM_DIR =
  import.meta.env.OPTIMISM_DIR ?? join(__dirname, '..', '.optimism')

// if running file directly similar to if name == main in python
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runDevnet()
}

/**
 * Clones optimism repo to git ignored .optimism directory and then runs the devnet
 * Depends on docker and foundry being installed.
 *
 * - L1 RPC - http://localhost:8545
 * - L2 RPC - http://localhost:9545
 *
 * Optimism pins a very specific version of foundry so you may need to install it.
 * It can be installed via running `pnpm run install:foundry` from optimism repo
 *
 * See [contributing](https://github.com/ethereum-optimism/optimism/blob/develop/CONTRIBUTING.md) if running into any other issues
 *
 * ## Additional Links
 *
 * - [optimism-devnet python script](https://github.com/ethereum-optimism/optimism/blob/develop/bedrock-devnet/devnet/__init__.py) this is what deploys contracts and starts the devnet in docker
 * - [optimism-devnet docker-compose file](https://github.com/ethereum-optimism/optimism/blob/develop/ops-bedrock/docker-compose.yml) this is where every op stack service is defined
 */
export async function runDevnet() {
  await setup()
  try {
    await start()
  } catch (e) {
    console.error(e)
    console.log('stopping optimism devnet')
    await stop().catch(console.error)
    console.error('Failed to start optimism devnet')

  }
  return stop
}

async function setup() {
  if (await fs.exists(OPTIMISM_DIR)) return
  console.log(`cloning optimism repo to ${OPTIMISM_DIR}`)
  // from context of root
  await execaCommand(
    `git clone git@github.com:ethereum-optimism/optimism.git ${OPTIMISM_DIR}`,
  )
  try {
    await execaCommand('pnpm i', { cwd: OPTIMISM_DIR, stdio: 'pipe' })
    await execaCommand('pnpm build', { cwd: OPTIMISM_DIR, stdio: 'pipe' })
  } catch (e) {
    console.error(e)
    throw new Error(
      `Failed to build optimism repo. You may need to delete the optimism directory and try again or manually build it by cding to optimism repo ${OPTIMISM_DIR}`,
      { cause: e }
    )
  }
}

async function start() {
  console.log('starting optimism devnet...')
  // from context of optimism dir
  await execaCommand('make devnet-up', { cwd: OPTIMISM_DIR, stdio: 'pipe' })
  console.log('optimism devnet started')
}

async function stop() {
  console.log('stopping optimism devnet...')
  await execaCommand('make devnet-down', { cwd: OPTIMISM_DIR, stdio: 'pipe' })
  console.log('optimism devnet stopped')
}
