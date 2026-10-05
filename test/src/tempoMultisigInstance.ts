import { execFileSync } from 'node:child_process'
import * as TestContainers from 'prool/testcontainers'
import { GenericContainer, Wait } from 'testcontainers'
import { nativeMultisigFactory } from '../../src/tempo/Addresses.js'

/** Creates a node with the native multisig recovery factory configured. */
export function create(options: { image: string; blockTime: string }) {
  const genesis = JSON.parse(
    execFileSync(
      'docker',
      [
        'run',
        '--rm',
        '--platform',
        'linux/amd64',
        options.image,
        '-q',
        'dump-genesis',
        '--chain',
        'dev',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    ),
  )
  genesis.config.multisigRecoveryFactory = nativeMultisigFactory
  return TestContainers.Instance.testcontainer({
    name: 'tempo',
    endpoints: { default: { protocol: 'http', port: 8545 } },
    container: () =>
      new GenericContainer(options.image)
        .withPlatform('linux/amd64')
        .withCopyContentToContainer([
          { content: JSON.stringify(genesis), target: '/tmp/genesis.json' },
        ])
        .withCommand([
          'node',
          '--dev',
          '--dev.block-time',
          options.blockTime,
          '--chain',
          '/tmp/genesis.json',
          '--datadir',
          '/tmp/tempo',
          '--http.addr',
          '0.0.0.0',
          '--http.port',
          '8545',
          '--http.api',
          'all',
          '--ws',
          '--ws.addr',
          '0.0.0.0',
          '--ws.port',
          '8545',
          '--ws.api',
          'all',
          '--engine.disable-precompile-cache',
          '--engine.legacy-state-root',
          '--faucet.enabled',
          '--faucet.node-address',
          'http://localhost:8545',
          '--faucet.private-key',
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          '--faucet.address',
          '0x20c0000000000000000000000000000000000000',
          '0x20c0000000000000000000000000000000000001',
          '0x20c0000000000000000000000000000000000002',
          '0x20c0000000000000000000000000000000000003',
          '--faucet.amount',
          '1000000000000',
        ])
        .withWaitStrategy(
          Wait.forLogMessage(
            /Received (block|new payload) from consensus engine/,
          ),
        ),
  })
}
