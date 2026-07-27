// TODO: Remove when T9 launches after https://github.com/tempoxyz/tempo/pull/6916 and
// https://github.com/tempoxyz/zones/pull/767 land.
import { execFileSync } from 'node:child_process'
import { AbiParameters, Address, Hash, Hex, Secp256k1 } from 'ox'
import { Instance } from 'prool'
import {
  GenericContainer,
  PullPolicy,
  type StartedTestContainer,
  Wait,
} from 'testcontainers'
import { pathUsd } from '../../../src/tempo/Addresses.js'

const zoneFactory = {
  address: '0x5aF2000000000000000000000000000000000000',
  code: '0xef',
} as const

const zoneMessenger = {
  address: '0x5A4D000000000000000000000000000000000000',
  artifact: 'ZoneMessenger',
} as const

const zonePortal = {
  address: '0x5AD1000000000000000000000000000000000000',
  artifact: 'ZonePortal',
} as const

const zoneVerifier = {
  address: '0x5A56000000000000000000000000000000000000',
  artifact: 'Verifier',
} as const

// Zone settlement reads Tempo block hashes from the canonical EIP-2935 account.
const historyStorage = {
  address: '0x0000f90827f1c53a10cb7a02335b175320002935',
  code: '0x3373fffffffffffffffffffffffffffffffffffffffe14604657602036036042575f35600143038111604257611fff81430311604257611fff9006545f5260205ff35b5f5ffd5b5f35611fff60014303065500',
} as const

const tip403Registry = {
  address: '0x403c000000000000000000000000000000000000',
  storage: {
    [Hash.keccak256(
      AbiParameters.encode(AbiParameters.from('address, uint256'), [
        pathUsd,
        4n,
      ]),
    )]: Hex.fromNumber((1n << 64n) | 1n, { size: 32 }),
  },
} as const

type Genesis = {
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

type ZoneArtifacts = {
  messenger: string
  portal: string
  verifier: string
}

type Parameters = {
  artifactsImage?: string | undefined
  blockTime: string
  image: string
  log?: Instance.tempo.Parameters['log'] | undefined
  ownerKey: `0x${string}`
  port: number
}

export function createTempo(parameters: Parameters) {
  return tempo({
    ...parameters,
    genesisContent: buildZoneGenesis(parameters),
  })
}

function buildZoneGenesis(options: {
  artifactsImage?: string | undefined
  image: string
  ownerKey: `0x${string}`
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
  const artifactsImage = options.artifactsImage
  if (!artifactsImage) {
    genesis.alloc[historyStorage.address] = {
      balance: '0x0',
      code: historyStorage.code,
      nonce: '0x1',
    }
    return `${JSON.stringify(genesis)}\n`
  }
  const artifacts = JSON.parse(
    execFileSync(
      'docker',
      [
        'run',
        '--rm',
        '--platform',
        'linux/amd64',
        '--entrypoint',
        '/usr/bin/jq',
        artifactsImage,
        '-n',
        '--slurpfile',
        'portal',
        `/app/specs/ref-impls/out/${zonePortal.artifact}.sol/${zonePortal.artifact}.json`,
        '--slurpfile',
        'messenger',
        `/app/specs/ref-impls/out/${zoneMessenger.artifact}.sol/${zoneMessenger.artifact}.json`,
        '--slurpfile',
        'verifier',
        `/app/specs/ref-impls/out/${zoneVerifier.artifact}.sol/${zoneVerifier.artifact}.json`,
        '{portal:$portal[0].deployedBytecode.object,messenger:$messenger[0].deployedBytecode.object,verifier:$verifier[0].deployedBytecode.object}',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    ),
  ) as ZoneArtifacts
  const owner = Address.fromPublicKey(
    Secp256k1.getPublicKey({ privateKey: options.ownerKey }),
  )
  genesis.alloc[zoneFactory.address] = {
    balance: '0x0',
    code: zoneFactory.code,
    storage: {
      // Slot 0 packs the owner and next Zone ID.
      [Hex.fromNumber(0n, { size: 32 })]: Hex.fromNumber(
        (Hex.toBigInt(owner) << 32n) | 1n,
        { size: 32 },
      ),
    },
  }
  genesis.alloc[zoneMessenger.address] = {
    balance: '0x0',
    code: artifacts.messenger,
    nonce: '0x1',
  }
  genesis.alloc[zonePortal.address] = {
    balance: '0x0',
    code: artifacts.portal,
    nonce: '0x1',
  }
  genesis.alloc[zoneVerifier.address] = {
    balance: '0x0',
    code: artifacts.verifier,
    nonce: '0x1',
  }
  genesis.alloc[historyStorage.address] = {
    balance: '0x0',
    code: historyStorage.code,
    nonce: '0x1',
  }
  const registry = genesis.alloc[tip403Registry.address]
  if (!registry) throw new Error('TIP-403 registry is unavailable.')
  registry.storage = { ...registry.storage, ...tip403Registry.storage }
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
