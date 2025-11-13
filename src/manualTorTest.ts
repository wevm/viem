/**
 * Manual Tor Integration Test
 *
 * To run:
 *   npx tsx src/manualTorTest.ts
 *
 * This is a standalone Node.js program that tests Tor integration
 * without any testing frameworks.
 */

import { TorClient } from 'tor-hazae41'
import { createPublicClient } from './clients/createPublicClient.js'
import { http } from './clients/transports/http.js'

const RPC_URL = 'https://eth.llamarpc.com/'
const SNOWFLAKE_URL = 'wss://snowflake.pse.dev/'

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--minimal')) {
    // Minimal version demonstrates small code
    runMinimalExample()
  } else {
    // This version is a bit verbose because we're actually doing some nice-ish
    // testing.
    runTest()
  }
}

async function runMinimalExample() {
  const client = createPublicClient({
    transport: http(RPC_URL, {
      tor: {
        filter: ['eth_getBalance'],
        snowflakeUrl: SNOWFLAKE_URL,
        onLog: (message, type) => log(`[tor] [${type}] ${message}`),
      },
    }),
  })

  const balance = await client.getBalance({
    address: '0x0000000000000000000000000000000000000000',
  })

  console.log(`${balance / 10n ** 18n} ETH burned at 0x0`)
  process.exit(0)
}

// Main execution
async function runTest() {
  try {
    log('Manual Tor Integration Test Starting...')

    // Check RPC connection first
    const rpcConnected = await checkRpcConnection()
    if (!rpcConnected) {
      process.exit(1)
    }

    // Run the test
    await testTorIntegration()

    log('\n✅ All tests completed successfully!')
    process.exit(0)
  } catch (error) {
    log('\n💥 Test execution failed:', error)
    process.exit(1)
  }
}

async function testTorIntegration() {
  log('Starting Tor Integration Test...')

  // Track usage flags
  let torUsed = false
  let regularUsed = false
  const torUsedMethods: string[] = []

  // Mock regular fetch that tracks usage
  const regularFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    log('>>> Regular fetch called for:', init?.body || 'no body')
    regularUsed = true

    // Use actual fetch for the request
    return fetch(input, init)
  }

  const tor = new TorClient({
    snowflakeUrl: SNOWFLAKE_URL,
    onLog: (message, type) => log(`[tor] [${type}] ${message}`),
  })

  // Wrapped TorClient that tracks usage
  const wrappedTorClient = {
    fetch: async (_input: string, init?: RequestInit) => {
      log('>>> Tor fetch called for:', init?.body || 'no body')
      torUsed = true

      // Parse the request to see which methods used Tor
      if (init?.body && typeof init.body === 'string') {
        try {
          const body = JSON.parse(init.body)
          const requests = Array.isArray(body) ? body : [body]
          const methods = requests.map((req: any) => req.method)
          torUsedMethods.push(...methods)
          log('>>> Tor routing methods:', methods)
        } catch (e) {
          log('>>> Failed to parse Tor request body:', e)
        }
      }

      // Forward to the real RPC endpoint over tor
      return tor.fetch(RPC_URL, init)
    },
  }

  try {
    const client = createPublicClient({
      transport: http(RPC_URL, {
        fetchFn: regularFetch,
        tor: {
          filter: ['eth_getBalance'], // Array of method names
          sharedClient: wrappedTorClient as any,
          snowflakeUrl: SNOWFLAKE_URL,
        },
      }),
    })

    const balance = await client.getBalance({
      address: '0x0000000000000000000000000000000000000000',
    })

    assert(typeof balance === 'bigint', 'Balance should be a bigint')
    assert(torUsed, 'Tor should have been used with array filter')
    assert(
      !regularUsed,
      'Regular fetch should NOT have been used with array filter',
    )
    log(`Balance with array filter: ${balance} (burned at 0x0)`)

    log('\n🎉 All tests passed! Tor integration is working correctly.')
  } catch (error) {
    log('\n❌ Test failed:', error)
    throw error
  }
}

async function log(message: string, ...args: any[]) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args)
}

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  log(`✓ ${message}`)
}

// Check if we can connect to the RPC endpoint
async function checkRpcConnection() {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    if (result.error) {
      throw new Error(`RPC Error: ${result.error.message}`)
    }

    log(`✓ RPC connection successful. Latest block: ${result.result}`)
    return true
  } catch (error) {
    log(`❌ Failed to connect to RPC at ${RPC_URL}:`, error)
    log(`Please make sure rpc is running at ${RPC_URL}`)
    return false
  }
}
