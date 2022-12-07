import { describe, expect, test } from 'vitest'

import { createHttpServer, initialBlockNumber } from '../../test'
import { localWsUrl } from '../../test/utils'

import { localhost, mainnet } from '../chains'
import { numberToHex } from './number'

import { HttpRequestError, TimeoutError, getSocket, rpc } from './rpc'

test('rpc', () => {
  expect(rpc).toMatchInlineSnapshot(`
    {
      "http": [Function],
      "webSocket": [Function],
      "webSocketAsync": [Function],
    }
  `)
})

describe('http', () => {
  test('valid request', async () => {
    expect(
      await rpc.http(localhost.rpcUrls.default.http[0], {
        body: { method: 'web3_clientVersion' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 0,
        "jsonrpc": "2.0",
        "result": "anvil/v0.1.0",
      }
    `)
  })

  test('valid request w/ incremented id', async () => {
    expect(
      await rpc.http(localhost.rpcUrls.default.http[0], {
        body: { method: 'web3_clientVersion' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 1,
        "jsonrpc": "2.0",
        "result": "anvil/v0.1.0",
      }
    `)
  })

  test('invalid rpc params', async () => {
    await expect(() =>
      rpc.http(localhost.rpcUrls.default.http[0], {
        body: { method: 'eth_getBlockByHash', params: ['0x0', false] },
      }),
    ).rejects.toThrowError(
      'invalid length 1, expected a (both 0x-prefixed or not) hex string',
    )
  })

  test('invalid request', async () => {
    expect(
      rpc.http(localhost.rpcUrls.default.http[0], {
        body: { method: 'eth_wagmi' },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot('"Method not found"')
  })

  test('http error', async () => {
    let retryCount = -1
    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 0,
      }),
    ).rejects.toThrowError(`Details: "ngmi"`)
    expect(retryCount).toBe(0)
  })

  test('http error', async () => {
    let retryCount = -1
    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 0,
      }),
    ).rejects.toThrowError('Details: Internal Server Error')
    expect(retryCount).toBe(0)
  })

  test('timeout', async () => {
    try {
      await rpc.http(mainnet.rpcUrls.default.http[0], {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        timeout: 10,
      })
    } catch (err) {
      expect(err).toMatchInlineSnapshot(
        `
        [TimeoutError: The request took too long to respond.

        URL: https://cloudflare-eth.com
        Request body: {"method":"eth_getBlockByNumber","params":["0xe6e560",false]}

        Details: The request timed out.
        Version: viem@1.0.2]
      `,
      )
    }
  })

  test('retries (500 status code)', async () => {
    let retryCount = -1

    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(500)
      res.end('ngmi')
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 2,
      }),
    ).rejects.toThrowError('The HTTP request failed.')
    expect(retryCount).toBe(2)
  })

  test('retries (408 status code)', async () => {
    let retryCount = -1
    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(408, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 2,
      }),
    ).rejects.toThrowError('The HTTP request failed.')
    expect(retryCount).toBe(2)
  })

  test('retries (408 status code)', async () => {
    let retryCount = -1
    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(408, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 2,
      }),
    ).rejects.toThrowError('The HTTP request failed.')
    expect(retryCount).toBe(2)
  })

  test('does not retry for 401', async () => {
    let retryCount = -1
    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(401, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 2,
      }),
    ).rejects.toThrowError('The HTTP request failed.')
    expect(retryCount).toBe(0)
  })

  test('retries (500 status code w/ Retry-After)', async () => {
    let retryCount = -1

    const server = await createHttpServer((req, res) => {
      retryCount++
      res.writeHead(500, {
        'Retry-After': 1,
      })
      res.end('ngmi')
    })

    await expect(() =>
      rpc.http(server.url, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        retryCount: 2,
      }),
    ).rejects.toThrowError('The HTTP request failed.')
    expect(retryCount).toBe(2)
  })
})

describe('getSocket', () => {
  test('creates WebSocket instance', async () => {
    const socket = await getSocket(localWsUrl)
    expect(socket).toBeDefined()
    expect(socket.readyState).toEqual(WebSocket.OPEN)
  })

  test('multiple invocations on a url only opens one socket', async () => {
    const [socket, socket2, socket3, socket4] = await Promise.all([
      getSocket(localWsUrl),
      getSocket(localWsUrl),
      getSocket(localWsUrl),
      getSocket(localWsUrl),
    ])
    expect(socket).toBe(socket2)
    expect(socket).toBe(socket3)
    expect(socket).toBe(socket4)
  })
})

describe('webSocket', () => {
  test('valid request', async () => {
    const socket = await getSocket(localWsUrl)
    const { id, ...version } = await new Promise<any>((resolve, reject) =>
      rpc.webSocket(socket, {
        body: { method: 'web3_clientVersion' },
        onData: resolve,
        onError: reject,
      }),
    )
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v0.1.0",
      }
    `)
  })

  test('valid request', async () => {
    const socket = await getSocket(localWsUrl)
    const { id, ...block } = await new Promise<any>((resolve, reject) =>
      rpc.webSocket(socket, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        onData: resolve,
        onError: reject,
      }),
    )
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x25fca330e",
          "difficulty": "0x291f53094f4a8f",
          "extraData": "0x455841506f6f6c",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0x8ede89",
          "hash": "0xf338169e315cc8de7e1d0e9edb09730cb508b392160d754774718b31cc4a70c0",
          "logsBloom": "0x78e4d12a55044c21c040b208e250557994080090a8d6052611513800740000614a028c2800042200020118e3c4044f20962524950c4336500e4126ec0132748228200162400b8308691e0c48421009e840d786030f025c40de005e8dc00270001b405808365e540a4a6430601920cd15440890a8081144d014ac9294816c3212c2a425005b82590116590053ad2ec001450071099921e209a4280a5349d050248a5a811925a264124992468e17782e71c145039030e2022a19a1cd1c2388411a4c013206024d0f08556a080c026b610d20623268012c161424100b0c0a9024e1a49a264944241112221112304b268a180809165e0588494c265d8c9062896a13",
          "miner": "0x886be08886fa12d3a0981a8e557b74f7937b42e7",
          "mixHash": "0xb7a247294fcf7a0c0f1f3627d09ba944c931a34fd5fdb925f1767d4c6ba876c9",
          "nonce": "0xffd255f3e945231d",
          "number": "0xe6e560",
          "parentHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
          "receiptsRoot": "0xd909117bfae22ac5f9d173904f7dc00a27ee3ff3d828dd961b71e253157d8542",
          "sealFields": [],
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0xe807",
          "stateRoot": "0x56f083bf74d3ead8b4f91f4982e734f2696a00586600569197c356a090122e22",
          "timestamp": "0x62ce4228",
          "totalDifficulty": "0xb68f994c887c1eb187d",
          "transactions": [
            "0x9697a030cfaee4cefb5e6a1359ecdcd03a0217416fa0888f3962c74f2c2074cb",
            "0xff275511f5034e7b101f5dc47b5bd83b8a92dc8741654b333798a11ba0117c73",
            "0xb86cb80f0e2dfa0beb35c550dc64c5bce89608ea147c212e334f7f503272e28b",
            "0xafe764c0a883e0c5c3a7bf0ec5bc5e8e948871ed7d9ed355461e03ea0e7effb3",
            "0x6ce25f644d88be8053d62dc120e2db45c14b20656b08fe71994fc7d3b270a11e",
            "0xfdd9f7722fcbfe7a912d7fa6cfbbfa55a490817e6cc8d3f23cabf7e7cec9d715",
            "0x21e8df6de5c18678c856fa59949ee8da05f943d8efd6e31dc95056dd8f44900e",
            "0x4a8dd40ac7f96089199307814ec6d1f31f1379945b38952bbe3033a1b160c601",
            "0x66c4c458125bf988e9e77f90f30e73e4d88d5f515a6312f4c0b7956dea27df53",
            "0x5bb4964eae74ca69e1887bfa091bf28c23e9d95e8f96913894e4a0a9a24bdab7",
            "0x41e399428eb8d252ab919b54eef3e69a22feafcbe2e4b7e610f01a211e5504ee",
            "0xd865cdcf4943fa25558b2b684cdde8ccbf8abe8d9ab1a497187edf954b92f6df",
            "0x95f9e32ac74bddcea6671a6d94e6d55a2dead9e3494ee6c3f36d88dcd3c5fbfa",
            "0x05d67ba3fa0152ecf15aa3b130c5e7e3e5c280e462b03c80a953f8b342ed12f2",
            "0xb7828c6a22d2f140a20c7f8d8cba10f4f0c36694fbf0f738153dca76c3b89931",
            "0x3f36118be046c89187ac3fb03ab0fa54d573f75c4ee3ea9b6d16efff4baa439d",
            "0xbea73e2f6dc161bf2027d7e3dd3eded01f22b170e58be32117e52da3b15a239f",
            "0x617f92df3031dc4f2b8f2cb549679c9dc71e8e62a162c2778801db37c7174a9e",
            "0x5926bf5ff52dfdcbeec66caac83bf7230c752d249d25b58f85a038f3b06a8645",
            "0x0fb76d42008cb47b6ad910941be0faf86b8da65d46dae1266d3c30c557babf98",
            "0x98c4ad85b754b7b389dbc89dd2088583b673df802d4aae61609e2414a844c77c",
            "0xd47905cee98ad95c73d2bd8d3f57d8979560a2b084aad5e1eac7aa76471592fa",
            "0x8835eb6fe0fcb8718302fea7c4087bd447446aab0b32dc8e9525dd8791d6f657",
            "0x66e921a5eb3bbf08cafdaf590e268fc1f5ca45ec2f1b01f641bfdbf6a139ff9e",
            "0x021f839c3311262d7efa5dd7f433a47f9c8507c0336299ef980ef700373add27",
            "0x9cd25187821a76acae12dc5ca5076c082400b77c1190ebb1f3bd2f645637afe3",
            "0xb1a0fdc0cf49a29c9be9ac41238bce662c931562d19561301906477440b47367",
            "0x5a4f37c57db5b3150af98c89e144dec2e133319345f243b8adf4003132e35b2c",
            "0xbb0e59750b8465eeb0802f1ab48c31e59a0dec91637de750af61733535aed1a9",
            "0xb5ce9d4415d96533bed8661387474b6ab9365b7494d9126febb221c28405353e",
            "0x01a0ad3b3af297342c02ae00271f38bb99fecf81304015cfef42c9495388231a",
            "0x68634fd1a5135e6a2a958ab8eb07c85c02ba2ba7f4d0f551a075dd4eeaec3432",
            "0x661b6916ee3d76d952f0c67cca75e1467106f6ea0068f9ff53939057baa0b167",
            "0x6564248734948ee775e7ea937a4b3f2614b4d2a0d21d6d26f1a722d8ad24cabf",
            "0x712de0d53047bb24e89782e6074621b12e154db3aebf0e39572698f6dc2cd545",
            "0xf8e444ab91fdde40678f414cf00d412fed08b67f2025d0e7f2762bf591b48020",
            "0x7986e584ac58ab8cfa88a8d81b4fcb048e06b648d2c2b853a7d37615822024b4",
            "0xb3d8dc32702e030d2a59cfbb3ac2a9503776eb7ab45555e226ebad5c2cc03099",
            "0x8634185373b183c64099638e3920f510c8bd31eda80c515c050b9a8486d0099d",
            "0x61c68bf7ede30842cd9626247b980c7620001f9731bc71e49c5c1ec79766b9a1",
            "0x577f895c53c0d7d5fc8dbd2ac8e8c5f0eddd1fbdfec2a95bc37745e8c6ee2e70",
            "0x89804c10c1be33b4c9b9c589d08e861fcfb39b512d3679ec7fa4c9d36b8098bd",
            "0xd74c615c90a58bff14dcd14f5c2fab63524769ba4fc6e4fb44dba73af217cb2f",
            "0xb477531e2d955548f433dc407a971477881eaed4184d0c2ad9f4c8a32235271c",
            "0xdbf7888cd72808c54a0d0b751de5227d79578dcae010f30e20044cf2a99cc999",
            "0xec2ebe27c616fa4d81d549fd31038c5c0f8d293d04a4e01504f27b4a344d12ef",
            "0x2bbb9095eb2b210b16736a6f63e1f19b140f6d7311a8ac378ee1bda8f5c4eee4",
            "0xd7d00c3e3c66467af7634cd68cbaf35a52c400c2fd6c023e388e6b7d67b5ec8d",
            "0x7612428192224d78b62eb84552282c768725cfeee32c4c5bdb9048e350d025d1",
            "0x77e9693f3c0d72c9ae907d58895510c05c9e6277ab3e77f7bffb6e8ff6c09d29",
            "0x97a9d1f6ffb51d9340d2108c486f48d83c6b85c9f75cf55fe061835c55ea9034",
            "0x42c6cd27050f2e3dcde9044f13b6faff039081e9f94ef8aac7c28213af5dfc0d",
            "0xd0dc28b8131993a758a49409f02c61be5abf714de12f8831260023e6e41c3dcb",
            "0x6fd6a1403a3a6c59eeb060f3de0633d58cc5b7caf8589b091c89c95f59eb08b3",
            "0x044da02de1bd319956b71fe68ce5dc1a9e63589e67eac3fc676a1d1cb6f748df",
            "0x62a0b41722bc828d5619c7d06737ff850d48e02b82750062e21a5cc1e9cca5ba",
            "0x47c4635dae8495ed7a4a2c07b447d1a09947638d3deab88a3c34e175a3d3e74b",
            "0x5d7b9085e755badec8dcdd5eb2643a5f2b5a3727c5f166d18311e12d3b363371",
            "0x0f02396f6b6a3e04e0183369a1215cb37b41306249194bee8076c789f1a1fada",
            "0xc4448561d055638a4898fc393b8f03544acbfaaaf7ed3762fb008932835f763d",
            "0xf2fd3c05824209f4372017e18ea18baa99ffd4ab8c90b095c9de2b84b35bfaf4",
            "0x72b87b3cfcd577cadbb4cdedeb5278d816b2ed8fcd4f4d84404b881b9d688d4f",
            "0x88d52aafcb6669401ba40399b2b59e2d41576cb3019974f14d7521efd5813b67",
            "0xcd7461b92d33e86e7fc6748f70b4eca188a1ae6d6c5c73811016ffae6f95196b",
            "0x03034b3bfb6e0ddf8e7406d72510da60defe0f4027f0dbd0eeb628adab21069c",
            "0x4e2344abd198cf4da17a8c32eeacb07960989e79261bb3c1c2f4b86b8c27b327",
            "0x5e689320a182926c160cc8f2ef669986f0fb44665f49df71ea5aeb0dfb38ee08",
            "0xfd6261442f1e45d27833102b1bf17dc0c7e84f21db8e92b0043ae63052618256",
            "0x796534d0c86fd48fa29dd9445f7e9fd071d86d2fc323efc7fda6ab56fb7b05de",
            "0x2b27cd3b94038e3c718b4e44cad5f25d6ec711252696ba49af3e059425852a71",
            "0xd8fc4e0eb0c70ea369e6c848c1c6715e5636b1dd162a9ca6b99cd89e759b1859",
            "0x2ab008f5cf2c0a1806f1bdafee86014b6bd68cf13c0c10aed6a175c07566b582",
            "0x735cf4ab1c5a3d5e897d77e2f2020053442cff259b6818d196fc40b57523ffbb",
            "0x5e7663ef708fc2d427434ba05f8943a90fc8b5114e82237e45831be2d725fa89",
            "0xb345b1beb2a0da05d84aaa248231c20e9d482d3c868513229d0143d9cf685499",
            "0x532ea5c2c01d00ca18ad986fb81dad749ae893dafb92197f7caaca1319de2778",
            "0xff63a4df3ae46db989b1b61d864a2876b3966d08eb43b1c6ab31ea1c8c3665c2",
            "0x5003a373b59325a7b30333e9a8e416040851ba0d95f8cec6b6ba5f5ae16c3a47",
            "0x5f4c43f3ee95bfef96fba605b53735d6e5ba03220f8834f1329a52ccf71a4efa",
            "0xcc96b149d0ff3a1756f204faad1ade4daaf53364cd33912ffa43e407b871b014",
            "0x65f5e649bde96f67a8bfbda0735f1090dc98b7e6fac70f4870037e49447a5004",
            "0x62ece0427e6ae6f8a9810bb3eaafdbd12c6e4218da29771ffdcf36415923d4c9",
            "0xe22d456ad5598a73e72e26ca9320805f05253c04e4d72498ffb46060f388f5af",
            "0x6b3f90e90f04ecff93d03197a5eb91aac05682ccf051340b8d9eb42512be0dac",
            "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722",
            "0xd452769a91831a7d00bdab8136c892f23c2c6bfec2e6a5db1efe42d4d32e7725",
            "0x4188a8de8da99cceff63f269aed7d7c4db61e96fadd33e89263f44a9a39ecfdc",
            "0x0bd8595602e79f38c47497a206dd66b218e82fe8ef021c68f05e8556f737702d",
            "0x5b3833caddf9c4275b85487e38b3dfa57105101cfc82947d34239c3389d1e528",
            "0xf0b4b4c65ffd72d5c6325e3aeb5012c059a2ad82219e6779f21678b188bf0bb8",
            "0x1a60d9f66780af4b0902026d701bf517cbe7c303cad26dc651806a374742b08b",
            "0x6dd90a8ff629bdc82df59a97c88c59f3cd513dde03c3a562d868881b42094c74",
            "0xce0a14541c9b5ab3ca067bca319ded2efd9ea6a1501eda6b267adeb81006f469",
            "0x8e646c08c501f2554f539f2fd71436e12480b5ad77bab3635c42237ca7a50771",
            "0xfbbcbdec45421af2d984217d32ebe45f3638495d6a560203ae6195874f507630",
            "0x00939783084c4f60fa2392af575f92b47e97d9236f23aae4d2f2c45881d484a9",
            "0x12f54fae81f7f817d6323397e1f1cab2da354a4d0ece04bcbbc4a9e61d055c18",
            "0x293516b8f59fff29f5ae67fa213536b0e906489d8973e5d66aa12bc2dc87e5f0",
            "0x4fce695a51719e881bcff039241f44ddbc61a662b97badabf4c7c2e7c8bf5efd",
            "0xfab6493fb8ddebb820856c529e17f5c9c66dc8d5216d95aa1f6ba0ad9a00a937",
            "0x9704cf7f9e8b24eb75c890d6521ad5685bbb1fd8458ad72a777ae782d3f07568",
            "0xeef49e2632d5573cd99eb230aab15c6b3660e489d59bcb6d1f3957a88bf5e2b3",
            "0x0d598dcc456a290d9f3bc84481f4e72a57906f34ae40d0d9e7e1439da8adbb9b",
            "0x7b661cb11d771098e1934ad8d9e5db065345d94fcda5f42a35d0cef1f5d37435",
            "0x3bd608fdea0838a0a726e05468d8da8bace59ddde41050c3c13442aae5e82dcf",
            "0x0a327b7f8b235897be7b3618a92a479028f85cfe94fb3a1d2230e1c385c1750c",
            "0x6b8d2437c2f2de0e6d96e7cab12f4ef95f3dbbb8bca0f43186243e56cc04c828",
            "0x18b255741f6bb12eed73beec66f6235c4e8d5fba731d497594011e546eac6571",
            "0x57949ba6e1cb686d045d84acd63733993457437cfc29e3a304350e356507ef94",
            "0xeefe5c091521f21b15eed162faba54a732e20abc116c972a05e6ad9d0257ca52",
            "0x7fcdcd93e6b51929ff2c74c84c547050e80489acb80b119ee7c859f54545c946",
            "0x8e66644066c38a2329b58868f6c9368b06d721d06b6aab83641bd055c2e4ef71",
            "0x4b834d4f40f4e769bfb6f845c516e0896a3dbc776733fbe472a8071748a80de5",
            "0x893d352adbc08a22c960ed3e54ba296b2e7a400bebd01d3df8691b71e8d3c333",
            "0x41f2dc4b538a3120cb6ba6a1541df35f13126978eb60eb08700287395f3c0b68",
            "0x765d1d811760b513af039b32c164b123c30f029be48713e8350dc012b7a06576",
            "0x75378ebb62606c2d9dc8f5e9deb518deae4af068577b5f978396e22f78b841e2",
            "0x9eba9b3d81117e13e1862409d60c4db4fe1cd8910df2b9620afc62798ce68ba8",
            "0xa56df8fcba7a5101681b26c1b9b95066aed99af31998df43ae20d4dd9167b72c",
            "0x4d8f4ba79c732c58680dd85f811d1ba64d1b1029588c9baebdbc695120709cf6",
            "0x91d8a6b8a6903f3705e77a623d173a45802fcc1d7fce21fddf2e9cc01a817546",
            "0x128493b578b408b7759ac816c20f65f93ea54fc07df5047c1b0c43c030e805ae",
            "0xcdfc35f5ecbbf42dca9c5b09a00cf5d9de53df70dc50a839752df0774a0f32c2",
            "0x00cbc7acaec8d5881b40e1ae867cda25afb62f0c6aa6a3e8ad81f99181c8dd8a",
          ],
          "transactionsRoot": "0x3fadac895bb584a7da5316da7dcd8acaf97c6d8bd21e6ff1e099fc0118116535",
          "uncles": [],
        },
      }
    `)
  })

  test('invalid request', async () => {
    const socket = await getSocket(localWsUrl)
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          rpc.webSocket(socket, {
            body: {
              method: 'wagmi_lol',
            },
            onData: resolve,
            onError: reject,
          }),
        ),
    ).rejects.toThrowError(
      'data did not match any variant of untagged enum EthRpcCall',
    )
  })
})

describe('webSocketAsync', () => {
  test('valid request', async () => {
    const socket = await getSocket(localWsUrl)
    const { id, ...version } = await rpc.webSocketAsync(socket, {
      body: { method: 'web3_clientVersion' },
    })
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v0.1.0",
      }
    `)
  })

  test('valid request', async () => {
    const socket = await getSocket(localWsUrl)
    const { id, ...block } = await rpc.webSocketAsync(socket, {
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(initialBlockNumber), false],
      },
    })
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x25fca330e",
          "difficulty": "0x291f53094f4a8f",
          "extraData": "0x455841506f6f6c",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0x8ede89",
          "hash": "0xf338169e315cc8de7e1d0e9edb09730cb508b392160d754774718b31cc4a70c0",
          "logsBloom": "0x78e4d12a55044c21c040b208e250557994080090a8d6052611513800740000614a028c2800042200020118e3c4044f20962524950c4336500e4126ec0132748228200162400b8308691e0c48421009e840d786030f025c40de005e8dc00270001b405808365e540a4a6430601920cd15440890a8081144d014ac9294816c3212c2a425005b82590116590053ad2ec001450071099921e209a4280a5349d050248a5a811925a264124992468e17782e71c145039030e2022a19a1cd1c2388411a4c013206024d0f08556a080c026b610d20623268012c161424100b0c0a9024e1a49a264944241112221112304b268a180809165e0588494c265d8c9062896a13",
          "miner": "0x886be08886fa12d3a0981a8e557b74f7937b42e7",
          "mixHash": "0xb7a247294fcf7a0c0f1f3627d09ba944c931a34fd5fdb925f1767d4c6ba876c9",
          "nonce": "0xffd255f3e945231d",
          "number": "0xe6e560",
          "parentHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
          "receiptsRoot": "0xd909117bfae22ac5f9d173904f7dc00a27ee3ff3d828dd961b71e253157d8542",
          "sealFields": [],
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0xe807",
          "stateRoot": "0x56f083bf74d3ead8b4f91f4982e734f2696a00586600569197c356a090122e22",
          "timestamp": "0x62ce4228",
          "totalDifficulty": "0xb68f994c887c1eb187d",
          "transactions": [
            "0x9697a030cfaee4cefb5e6a1359ecdcd03a0217416fa0888f3962c74f2c2074cb",
            "0xff275511f5034e7b101f5dc47b5bd83b8a92dc8741654b333798a11ba0117c73",
            "0xb86cb80f0e2dfa0beb35c550dc64c5bce89608ea147c212e334f7f503272e28b",
            "0xafe764c0a883e0c5c3a7bf0ec5bc5e8e948871ed7d9ed355461e03ea0e7effb3",
            "0x6ce25f644d88be8053d62dc120e2db45c14b20656b08fe71994fc7d3b270a11e",
            "0xfdd9f7722fcbfe7a912d7fa6cfbbfa55a490817e6cc8d3f23cabf7e7cec9d715",
            "0x21e8df6de5c18678c856fa59949ee8da05f943d8efd6e31dc95056dd8f44900e",
            "0x4a8dd40ac7f96089199307814ec6d1f31f1379945b38952bbe3033a1b160c601",
            "0x66c4c458125bf988e9e77f90f30e73e4d88d5f515a6312f4c0b7956dea27df53",
            "0x5bb4964eae74ca69e1887bfa091bf28c23e9d95e8f96913894e4a0a9a24bdab7",
            "0x41e399428eb8d252ab919b54eef3e69a22feafcbe2e4b7e610f01a211e5504ee",
            "0xd865cdcf4943fa25558b2b684cdde8ccbf8abe8d9ab1a497187edf954b92f6df",
            "0x95f9e32ac74bddcea6671a6d94e6d55a2dead9e3494ee6c3f36d88dcd3c5fbfa",
            "0x05d67ba3fa0152ecf15aa3b130c5e7e3e5c280e462b03c80a953f8b342ed12f2",
            "0xb7828c6a22d2f140a20c7f8d8cba10f4f0c36694fbf0f738153dca76c3b89931",
            "0x3f36118be046c89187ac3fb03ab0fa54d573f75c4ee3ea9b6d16efff4baa439d",
            "0xbea73e2f6dc161bf2027d7e3dd3eded01f22b170e58be32117e52da3b15a239f",
            "0x617f92df3031dc4f2b8f2cb549679c9dc71e8e62a162c2778801db37c7174a9e",
            "0x5926bf5ff52dfdcbeec66caac83bf7230c752d249d25b58f85a038f3b06a8645",
            "0x0fb76d42008cb47b6ad910941be0faf86b8da65d46dae1266d3c30c557babf98",
            "0x98c4ad85b754b7b389dbc89dd2088583b673df802d4aae61609e2414a844c77c",
            "0xd47905cee98ad95c73d2bd8d3f57d8979560a2b084aad5e1eac7aa76471592fa",
            "0x8835eb6fe0fcb8718302fea7c4087bd447446aab0b32dc8e9525dd8791d6f657",
            "0x66e921a5eb3bbf08cafdaf590e268fc1f5ca45ec2f1b01f641bfdbf6a139ff9e",
            "0x021f839c3311262d7efa5dd7f433a47f9c8507c0336299ef980ef700373add27",
            "0x9cd25187821a76acae12dc5ca5076c082400b77c1190ebb1f3bd2f645637afe3",
            "0xb1a0fdc0cf49a29c9be9ac41238bce662c931562d19561301906477440b47367",
            "0x5a4f37c57db5b3150af98c89e144dec2e133319345f243b8adf4003132e35b2c",
            "0xbb0e59750b8465eeb0802f1ab48c31e59a0dec91637de750af61733535aed1a9",
            "0xb5ce9d4415d96533bed8661387474b6ab9365b7494d9126febb221c28405353e",
            "0x01a0ad3b3af297342c02ae00271f38bb99fecf81304015cfef42c9495388231a",
            "0x68634fd1a5135e6a2a958ab8eb07c85c02ba2ba7f4d0f551a075dd4eeaec3432",
            "0x661b6916ee3d76d952f0c67cca75e1467106f6ea0068f9ff53939057baa0b167",
            "0x6564248734948ee775e7ea937a4b3f2614b4d2a0d21d6d26f1a722d8ad24cabf",
            "0x712de0d53047bb24e89782e6074621b12e154db3aebf0e39572698f6dc2cd545",
            "0xf8e444ab91fdde40678f414cf00d412fed08b67f2025d0e7f2762bf591b48020",
            "0x7986e584ac58ab8cfa88a8d81b4fcb048e06b648d2c2b853a7d37615822024b4",
            "0xb3d8dc32702e030d2a59cfbb3ac2a9503776eb7ab45555e226ebad5c2cc03099",
            "0x8634185373b183c64099638e3920f510c8bd31eda80c515c050b9a8486d0099d",
            "0x61c68bf7ede30842cd9626247b980c7620001f9731bc71e49c5c1ec79766b9a1",
            "0x577f895c53c0d7d5fc8dbd2ac8e8c5f0eddd1fbdfec2a95bc37745e8c6ee2e70",
            "0x89804c10c1be33b4c9b9c589d08e861fcfb39b512d3679ec7fa4c9d36b8098bd",
            "0xd74c615c90a58bff14dcd14f5c2fab63524769ba4fc6e4fb44dba73af217cb2f",
            "0xb477531e2d955548f433dc407a971477881eaed4184d0c2ad9f4c8a32235271c",
            "0xdbf7888cd72808c54a0d0b751de5227d79578dcae010f30e20044cf2a99cc999",
            "0xec2ebe27c616fa4d81d549fd31038c5c0f8d293d04a4e01504f27b4a344d12ef",
            "0x2bbb9095eb2b210b16736a6f63e1f19b140f6d7311a8ac378ee1bda8f5c4eee4",
            "0xd7d00c3e3c66467af7634cd68cbaf35a52c400c2fd6c023e388e6b7d67b5ec8d",
            "0x7612428192224d78b62eb84552282c768725cfeee32c4c5bdb9048e350d025d1",
            "0x77e9693f3c0d72c9ae907d58895510c05c9e6277ab3e77f7bffb6e8ff6c09d29",
            "0x97a9d1f6ffb51d9340d2108c486f48d83c6b85c9f75cf55fe061835c55ea9034",
            "0x42c6cd27050f2e3dcde9044f13b6faff039081e9f94ef8aac7c28213af5dfc0d",
            "0xd0dc28b8131993a758a49409f02c61be5abf714de12f8831260023e6e41c3dcb",
            "0x6fd6a1403a3a6c59eeb060f3de0633d58cc5b7caf8589b091c89c95f59eb08b3",
            "0x044da02de1bd319956b71fe68ce5dc1a9e63589e67eac3fc676a1d1cb6f748df",
            "0x62a0b41722bc828d5619c7d06737ff850d48e02b82750062e21a5cc1e9cca5ba",
            "0x47c4635dae8495ed7a4a2c07b447d1a09947638d3deab88a3c34e175a3d3e74b",
            "0x5d7b9085e755badec8dcdd5eb2643a5f2b5a3727c5f166d18311e12d3b363371",
            "0x0f02396f6b6a3e04e0183369a1215cb37b41306249194bee8076c789f1a1fada",
            "0xc4448561d055638a4898fc393b8f03544acbfaaaf7ed3762fb008932835f763d",
            "0xf2fd3c05824209f4372017e18ea18baa99ffd4ab8c90b095c9de2b84b35bfaf4",
            "0x72b87b3cfcd577cadbb4cdedeb5278d816b2ed8fcd4f4d84404b881b9d688d4f",
            "0x88d52aafcb6669401ba40399b2b59e2d41576cb3019974f14d7521efd5813b67",
            "0xcd7461b92d33e86e7fc6748f70b4eca188a1ae6d6c5c73811016ffae6f95196b",
            "0x03034b3bfb6e0ddf8e7406d72510da60defe0f4027f0dbd0eeb628adab21069c",
            "0x4e2344abd198cf4da17a8c32eeacb07960989e79261bb3c1c2f4b86b8c27b327",
            "0x5e689320a182926c160cc8f2ef669986f0fb44665f49df71ea5aeb0dfb38ee08",
            "0xfd6261442f1e45d27833102b1bf17dc0c7e84f21db8e92b0043ae63052618256",
            "0x796534d0c86fd48fa29dd9445f7e9fd071d86d2fc323efc7fda6ab56fb7b05de",
            "0x2b27cd3b94038e3c718b4e44cad5f25d6ec711252696ba49af3e059425852a71",
            "0xd8fc4e0eb0c70ea369e6c848c1c6715e5636b1dd162a9ca6b99cd89e759b1859",
            "0x2ab008f5cf2c0a1806f1bdafee86014b6bd68cf13c0c10aed6a175c07566b582",
            "0x735cf4ab1c5a3d5e897d77e2f2020053442cff259b6818d196fc40b57523ffbb",
            "0x5e7663ef708fc2d427434ba05f8943a90fc8b5114e82237e45831be2d725fa89",
            "0xb345b1beb2a0da05d84aaa248231c20e9d482d3c868513229d0143d9cf685499",
            "0x532ea5c2c01d00ca18ad986fb81dad749ae893dafb92197f7caaca1319de2778",
            "0xff63a4df3ae46db989b1b61d864a2876b3966d08eb43b1c6ab31ea1c8c3665c2",
            "0x5003a373b59325a7b30333e9a8e416040851ba0d95f8cec6b6ba5f5ae16c3a47",
            "0x5f4c43f3ee95bfef96fba605b53735d6e5ba03220f8834f1329a52ccf71a4efa",
            "0xcc96b149d0ff3a1756f204faad1ade4daaf53364cd33912ffa43e407b871b014",
            "0x65f5e649bde96f67a8bfbda0735f1090dc98b7e6fac70f4870037e49447a5004",
            "0x62ece0427e6ae6f8a9810bb3eaafdbd12c6e4218da29771ffdcf36415923d4c9",
            "0xe22d456ad5598a73e72e26ca9320805f05253c04e4d72498ffb46060f388f5af",
            "0x6b3f90e90f04ecff93d03197a5eb91aac05682ccf051340b8d9eb42512be0dac",
            "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722",
            "0xd452769a91831a7d00bdab8136c892f23c2c6bfec2e6a5db1efe42d4d32e7725",
            "0x4188a8de8da99cceff63f269aed7d7c4db61e96fadd33e89263f44a9a39ecfdc",
            "0x0bd8595602e79f38c47497a206dd66b218e82fe8ef021c68f05e8556f737702d",
            "0x5b3833caddf9c4275b85487e38b3dfa57105101cfc82947d34239c3389d1e528",
            "0xf0b4b4c65ffd72d5c6325e3aeb5012c059a2ad82219e6779f21678b188bf0bb8",
            "0x1a60d9f66780af4b0902026d701bf517cbe7c303cad26dc651806a374742b08b",
            "0x6dd90a8ff629bdc82df59a97c88c59f3cd513dde03c3a562d868881b42094c74",
            "0xce0a14541c9b5ab3ca067bca319ded2efd9ea6a1501eda6b267adeb81006f469",
            "0x8e646c08c501f2554f539f2fd71436e12480b5ad77bab3635c42237ca7a50771",
            "0xfbbcbdec45421af2d984217d32ebe45f3638495d6a560203ae6195874f507630",
            "0x00939783084c4f60fa2392af575f92b47e97d9236f23aae4d2f2c45881d484a9",
            "0x12f54fae81f7f817d6323397e1f1cab2da354a4d0ece04bcbbc4a9e61d055c18",
            "0x293516b8f59fff29f5ae67fa213536b0e906489d8973e5d66aa12bc2dc87e5f0",
            "0x4fce695a51719e881bcff039241f44ddbc61a662b97badabf4c7c2e7c8bf5efd",
            "0xfab6493fb8ddebb820856c529e17f5c9c66dc8d5216d95aa1f6ba0ad9a00a937",
            "0x9704cf7f9e8b24eb75c890d6521ad5685bbb1fd8458ad72a777ae782d3f07568",
            "0xeef49e2632d5573cd99eb230aab15c6b3660e489d59bcb6d1f3957a88bf5e2b3",
            "0x0d598dcc456a290d9f3bc84481f4e72a57906f34ae40d0d9e7e1439da8adbb9b",
            "0x7b661cb11d771098e1934ad8d9e5db065345d94fcda5f42a35d0cef1f5d37435",
            "0x3bd608fdea0838a0a726e05468d8da8bace59ddde41050c3c13442aae5e82dcf",
            "0x0a327b7f8b235897be7b3618a92a479028f85cfe94fb3a1d2230e1c385c1750c",
            "0x6b8d2437c2f2de0e6d96e7cab12f4ef95f3dbbb8bca0f43186243e56cc04c828",
            "0x18b255741f6bb12eed73beec66f6235c4e8d5fba731d497594011e546eac6571",
            "0x57949ba6e1cb686d045d84acd63733993457437cfc29e3a304350e356507ef94",
            "0xeefe5c091521f21b15eed162faba54a732e20abc116c972a05e6ad9d0257ca52",
            "0x7fcdcd93e6b51929ff2c74c84c547050e80489acb80b119ee7c859f54545c946",
            "0x8e66644066c38a2329b58868f6c9368b06d721d06b6aab83641bd055c2e4ef71",
            "0x4b834d4f40f4e769bfb6f845c516e0896a3dbc776733fbe472a8071748a80de5",
            "0x893d352adbc08a22c960ed3e54ba296b2e7a400bebd01d3df8691b71e8d3c333",
            "0x41f2dc4b538a3120cb6ba6a1541df35f13126978eb60eb08700287395f3c0b68",
            "0x765d1d811760b513af039b32c164b123c30f029be48713e8350dc012b7a06576",
            "0x75378ebb62606c2d9dc8f5e9deb518deae4af068577b5f978396e22f78b841e2",
            "0x9eba9b3d81117e13e1862409d60c4db4fe1cd8910df2b9620afc62798ce68ba8",
            "0xa56df8fcba7a5101681b26c1b9b95066aed99af31998df43ae20d4dd9167b72c",
            "0x4d8f4ba79c732c58680dd85f811d1ba64d1b1029588c9baebdbc695120709cf6",
            "0x91d8a6b8a6903f3705e77a623d173a45802fcc1d7fce21fddf2e9cc01a817546",
            "0x128493b578b408b7759ac816c20f65f93ea54fc07df5047c1b0c43c030e805ae",
            "0xcdfc35f5ecbbf42dca9c5b09a00cf5d9de53df70dc50a839752df0774a0f32c2",
            "0x00cbc7acaec8d5881b40e1ae867cda25afb62f0c6aa6a3e8ad81f99181c8dd8a",
          ],
          "transactionsRoot": "0x3fadac895bb584a7da5316da7dcd8acaf97c6d8bd21e6ff1e099fc0118116535",
          "uncles": [],
        },
      }
    `)
  })

  test('invalid request', async () => {
    const socket = await getSocket(localWsUrl)
    await expect(() =>
      rpc.webSocketAsync(socket, {
        body: {
          method: 'wagmi_lol',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"data did not match any variant of untagged enum EthRpcCall"',
    )
  })

  test.skip('timeout', async () => {
    const socket = await getSocket(localWsUrl)
    try {
      await rpc.webSocketAsync(socket, {
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(initialBlockNumber), false],
        },
        timeout: 10,
      })
    } catch (err) {
      expect(err).toMatchInlineSnapshot(`
        [TimeoutError: The request took too long to respond.

        URL: wss://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
        Request body: {"method":"eth_getBlockByNumber","params":["0xe6e560",false]}

        Details: The request timed out.
        Version: viem@1.0.2]
      `)
    }
  })
})

test('HttpRequestError', () => {
  const err = new HttpRequestError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(initialBlockNumber), false],
    },
    status: 500,
    details: 'Some error',
  })
  expect(err).toMatchInlineSnapshot(`
    [HttpRequestError: The HTTP request failed.

    Status: 500
    URL: https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
    Request body: {"method":"eth_getBlockByNumber","params":["0xe6e560",false]}

    Details: Some error
    Version: viem@1.0.2]
  `)
})

test('TimeoutError', () => {
  const err = new TimeoutError({
    url: 'https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    body: {
      method: 'eth_getBlockByNumber',
      params: [numberToHex(initialBlockNumber), false],
    },
  })
  expect(err).toMatchInlineSnapshot(`
    [TimeoutError: The request took too long to respond.

    URL: https://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC
    Request body: {"method":"eth_getBlockByNumber","params":["0xe6e560",false]}

    Details: The request timed out.
    Version: viem@1.0.2]
  `)
})
