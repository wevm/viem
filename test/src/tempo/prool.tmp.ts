// TODO: Remove this file when Tempo's dev genesis includes EIP-2935 history storage and pre-T10 localnet coverage is retired.
import { execFileSync } from 'node:child_process'
import { Instance } from 'prool'
import {
  GenericContainer,
  PullPolicy,
  type StartedTestContainer,
  Wait,
} from 'testcontainers'

const zoneFactory = {
  address: '0x5aF2000000000000000000000000000000000000',
} as const

const zoneMessenger = {
  address: '0x5A4D000000000000000000000000000000000000',
} as const

const zonePortal = {
  address: '0x5AD1000000000000000000000000000000000000',
} as const

const zoneVerifier = {
  address: '0x5A56000000000000000000000000000000000000',
} as const

// Zone settlement reads Tempo block hashes from the canonical EIP-2935 account.
const historyStorage = {
  address: '0x0000f90827f1c53a10cb7a02335b175320002935',
  code: '0x3373fffffffffffffffffffffffffffffffffffffffe14604657602036036042575f35600143038111604257611fff81430311604257611fff9006545f5260205ff35b5f5ffd5b5f35611fff60014303065500',
} as const

type Genesis = {
  config: {
    t10Time?: number | string | undefined
  }
  alloc: Record<
    string,
    {
      balance?: string | undefined
      code?: string | undefined
      nonce?: string | undefined
      storage?: Record<string, string> | undefined
    }
  >
}

type Parameters = {
  blockTime: string
  hardfork?: string | undefined
  image: string
  log?: Instance.tempo.Parameters['log'] | undefined
  port: number
}

export function createCustomTempo(parameters: Parameters) {
  return tempo({
    ...parameters,
    genesisContent: buildCustomGenesis(parameters),
  })
}

function buildCustomGenesis(options: {
  hardfork?: string | undefined
  image: string
}) {
  const dumped = execFileSync(
    'docker',
    [
      'run',
      '--rm',
      '--platform',
      'linux/amd64',
      '--entrypoint',
      '/usr/local/bin/tempo',
      options.image,
      '-q',
      'dump-genesis',
      '--chain',
      'dev',
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  )
  const genesis = JSON.parse(dumped) as Genesis
  if (options.hardfork === 'T9') {
    delete genesis.config.t10Time
    delete genesis.alloc[zoneFactory.address]
    delete genesis.alloc[zoneMessenger.address]
    delete genesis.alloc[zonePortal.address]
    delete genesis.alloc[zoneVerifier.address]
  }
  genesis.alloc[historyStorage.address] = {
    balance: '0x0',
    code: historyStorage.code,
    nonce: '0x1',
  }
  return `${JSON.stringify(genesis)}\n`
}

const tempoContainerPort = 8545

const tempo = Instance.define(
  (parameters: {
    blockTime: string
    genesisContent: string
    image: string
    log?: Instance.tempo.Parameters['log'] | undefined
    port: number
  }) => {
    const log = parameters.log
    const rustLog = log && typeof log !== 'boolean' ? log : ''
    let container: StartedTestContainer | undefined

    return {
      _internal: {},
      host: 'localhost',
      name: 'tempo',
      port: parameters.port,
      async start(_, { emitter, setEndpoint }) {
        const genesisPath = '/tmp/tempo-dev-eip2935.json'
        const container_ = await new GenericContainer(parameters.image)
          .withPullPolicy(PullPolicy.alwaysPull())
          .withPlatform('linux/amd64')
          .withExposedPorts(tempoContainerPort)
          .withExtraHosts([
            { host: 'host.docker.internal', ipAddress: 'host-gateway' },
          ])
          .withName(`tempo.${crypto.randomUUID()}`)
          .withEnvironment({ RUST_LOG: rustLog })
          .withCopyContentToContainer([
            { content: parameters.genesisContent, target: genesisPath },
          ])
          .withCommand([
            'node',
            '--authrpc.port',
            '8551',
            '--datadir',
            '/tmp/prool-tempo',
            '--dev',
            '--dev.block-time',
            parameters.blockTime,
            '--engine.disable-precompile-cache',
            '--engine.legacy-state-root',
            '--faucet.address',
            '0x20c0000000000000000000000000000000000000',
            '0x20c0000000000000000000000000000000000001',
            '0x20c0000000000000000000000000000000000002',
            '0x20c0000000000000000000000000000000000003',
            '--faucet.amount',
            '1000000000000',
            '--faucet.enabled',
            '--faucet.private-key',
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            '--faucet.node-address',
            `http://localhost:${tempoContainerPort}`,
            '--http.addr',
            '0.0.0.0',
            '--http.api',
            'all',
            '--http.corsdomain',
            '*',
            '--http.port',
            String(tempoContainerPort),
            '--port',
            '30303',
            '--ws',
            '--ws.addr',
            '0.0.0.0',
            '--ws.api',
            'all',
            '--ws.port',
            String(tempoContainerPort),
            '--chain',
            genesisPath,
          ])
          .withWaitStrategy(Wait.forListeningPorts())
          .withLogConsumer((stream) => {
            stream.on('data', (data) => {
              const message = data.toString()
              emitter.emit('message', message)
              emitter.emit('stdout', message)
              if (log) process.stdout.write(message)
            })
            stream.on('error', (error) => {
              emitter.emit('message', error.message)
              emitter.emit('stderr', error.message)
              if (log) process.stderr.write(`${error.message}\n`)
            })
          })
          .withStartupTimeout(120_000)
          .start()
        container = container_
        setEndpoint?.({
          host: container_.getHost(),
          port: container_.getMappedPort(tempoContainerPort),
        })
      },
      async stop() {
        await container?.stop()
        container = undefined
      },
    }
  },
)
