import { anvil } from 'prool/instances'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber, mine } from '../../actions/index.js'
import { http, createClient } from '../../index.js'
import type { RpcResponse } from '../../types/rpc.js'
import { numberToHex } from '../index.js'
import { wait } from '../wait.js'
import { extractMessages, getIpcRpcClient } from './ipc.js'

const client = createClient({
  chain: anvilMainnet.chain,
  transport: http('http://127.0.0.1:6968'),
}).extend(() => ({ mode: 'anvil' }))

const instance = anvil({
  port: 6968,
  ipc: anvilMainnet.rpcUrl.ipc,
  forkBlockNumber: anvilMainnet.forkBlockNumber,
  forkUrl: anvilMainnet.forkUrl,
})

beforeAll(async () => {
  await instance.start()
})

afterAll(async () => {
  await instance.stop()
})

describe('getIpcRpcClient', () => {
  test('creates IPC instance', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    expect(rpcClient).toBeDefined()
    expect(rpcClient.socket.readyState).toEqual('open')
    rpcClient.close()
  })

  test('multiple invocations on a url only opens one socket', async () => {
    const [client1, client2, client3, client4] = await Promise.all([
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
      getIpcRpcClient(anvilMainnet.rpcUrl.ipc),
    ])
    expect(client1).toEqual(client2)
    expect(client1).toEqual(client3)
    expect(client1).toEqual(client4)
    client1.close()
  })
})

describe('request', () => {
  test('valid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...version } = await new Promise<any>((resolve) =>
      rpcClient.request({
        body: { method: 'web3_clientVersion' },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.0.0",
      }
    `)
    expect(rpcClient.requests.size).toBe(0)
    rpcClient.close()
  })

  test('valid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...block } = await new Promise<any>((resolve) =>
      rpcClient.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x227fec6b",
          "blobGasUsed": "0x0",
          "difficulty": "0x0",
          "excessBlobGas": "0x20000",
          "extraData": "0xd983010e0d846765746889676f312e32322e3131856c696e7578",
          "gasLimit": "0x224c7ad",
          "gasUsed": "0x3d9ddc",
          "hash": "0xe84f123bd1dbb0bc21807a48079e21d5a3ee68b9629ab72d889436e8de57e919",
          "logsBloom": "0x906108000108400000818203842012000420102940210030628000400812208410710804220810002000050240124991460900518c0b825600a3228004284d484d01204409048110c88040181060a4e404000010c140480410100408800002146820180002c3402104088390104028821080440a04100c009a10003400051261b0100444000020004314006810306010020b04814526000c90408840281004921a214200301029c0400288e00001280c341080820840088024280402004060410202101a6300010040000818110c024480146009020000346808001a080860020510301000800024008000510480000190002100010c04c00040018408000c41",
          "miner": "0x388c818ca8b9251b393131c08a736a67ccb19297",
          "mixHash": "0xab048d1aba06968cf2a054968593c88d54edf4a8c303a7bf045d9a55d655ab07",
          "nonce": "0x0000000000000000",
          "number": "0x1527101",
          "parentBeaconBlockRoot": "0xa3c571522029f61c8a3ab34a6683b461ebcebbae0786a597babb69cc479c7c88",
          "parentHash": "0x0c594782f0363fc69f546a34c6dfd2d51aca62a6348dd2432243eb9c65b8c14a",
          "receiptsRoot": "0x02e8fada9484c1c30d5eba8ee6516b49e703db0ed25f4dc494b67d7580f64739",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x4b5e",
          "stateRoot": "0xb72df164d58ca907fbd8593cd0c1a2b2f985745bf76f905a6a09abbaee4669b4",
          "timestamp": "0x67ecf833",
          "transactions": [
            "0x854722bdc63c7b3a389391c88cf8ba8215a78348e57fc1cc12fd0ab5281ddbee",
            "0x02cae7161a4e06197ae0178b4875299932bbb88bb7722b8d45dd4be10ed78c98",
            "0xb7d723dfdbd3c3bab81060b438bd87bcf07914753d39e2a0faddb87066e7944f",
            "0x4787c0f5ee67cb10805c4e9cc81ea5f7037a7eda4e93ef145ae4c2fecf03f660",
            "0x59ff041e644a7294cf79da092f65af4329ea6cabe88bd1df53d0ab4518cc518f",
            "0x5520923d4abe5a7a1eb9d481eba9a69740fabdf95b3aae9594a8c1005f5424b6",
            "0x4f547ae4274b602dff5cde7a7fa962bd451e639ba2b856c903009f831715aa56",
            "0x83bce88701a89e0df991dacc817ecb31671a8aa06e0725aceaf2e03f93258237",
            "0xb56128d1a930d85d529f05a8a01ab8ac31341be758c4f733ba13b32ebc2a4cea",
            "0x01886366db19111106a42f7a3fce8d3a31266e72478403c901c9b59bf2bd01dc",
            "0xa2f08cebd167a4cae54c5e2d6907b5e2d49739ca3881214c49e58a37bf6e9455",
            "0xf4174f3311480a400f9a7d8960c7440c186e1beedf2dc946f81a87b0d48d235a",
            "0xcf8b1cd812489193f99cee59d558364ce36593bc89bbc174851d173897241180",
            "0xfb0267c2413094f54a4cc4e913e6fc384ef2ea31bd15b5371d1be17206f41602",
            "0x5ee9e22b89405c490d938e8904d8f50e5788cb400f6f8f89523227eddf8b0629",
            "0xbd808d6736b93870c1a81cb944b444ec02611d85136647c090502ce86bf9c923",
            "0x18c1c967ff87ae710de86210a32e13999509aeaa1472296c17faefe145c53f91",
            "0xfc759550f99be38b1a938f3bd26267353828476e7f5a8dabebb676f710f380de",
            "0x4019b7b381fa1daadad90b4b6d2e02de07eb1e8d6f0b36bb14b62f2e85fe9efa",
            "0xd2bac5f3c8d0b8ea1efc84fea5b7c92ac1369f9b7be90527ffbbb35d35aca077",
            "0xfd69918724b556e832e85e22a359891e08fcab37f4e6c70a8ff1699176e15453",
            "0x50a7e4b5697b0df1bb4a6bbf97321bb94a996fea894aa071fc210a7423cf4838",
            "0x1af867463b10a71305740219c1fab218571d88f5b75472ad8c25885cbfc01b91",
            "0x5c67e0c7ab694c4714576ff54d2bd2dc6b19dcd55df337ceb72bfcc89034becf",
            "0x2b917db8c9adbdd78fd0bab4edf8f599c2ac99c8b6171b1dc3fc42bc3607d164",
            "0xa15e4bca5ac39a8d3023dad307b3743f801baefba07f203f98429c71cf2d2582",
            "0x8cb6e16ecc5d6b659170423b6e5bb39ccd6933ca214c843ba079ad6306111000",
            "0x269f116d71f5886f59dbfb63ea5a1d4621afc6e6f163f984fd4d1a6c33ebdddc",
            "0x2129b8e7f727a14b793959c5a812ad3ad65c6dfd2b4d41944baa40c56bec0312",
            "0xa026091fa779b2fa5a05afdc01b9af8c618e936ee237274f500ca4b07761b6a3",
            "0x1af67c12db72606b9687d413fd3b9a7960e78d38df615e9e8094192055f9f8ba",
            "0xf00dd3ad522918ff5af7fd8eb85946736d119e5ae560bc5339d3197d03a27c25",
            "0xa196faa90844cc30ed6e48f31e5f5e44415c0a9ce605b5537c80fbc8c597c2eb",
            "0x9b01070b12d11f4e980a37ae00716f58c0ef45482984e21219011e8c96c3359a",
            "0xb20c352eb48b4b0166a64d947b9bf43a0a6da5c3f6f61742725e3ac692d351b5",
            "0xaacc6e6b9ca5935a28cdc115ec187a093031c8f071785b1077525ad62caff8ef",
            "0xee8bfcf3180572c02cbd7d7a0a60d616d58a5a689057a23e38e78aea2980a481",
            "0xba86efff334626a0abef6b52be7648ab073049636d6bca087b473d2e24353103",
            "0x8a3eba30e9d148a217434f2951882d8a620a0a37fddbfef7063c4c0914d33712",
            "0xec9ebbe6e1855f3b9f6e20be38bde066e353bd35604e43a96a24e65e6760781c",
            "0x86df945e7311b1b341f2ebfd3ad7979d5dec093a3de6e89a7233374129b6df1a",
            "0x63870fcb38ea65b28ec381a48c49ae92477662bea9ae78c8a88fff309adb596a",
            "0x6711b81447f1f43eab0609e4f3281b421c8252cd3e95252f2843f2666f916e67",
            "0x053cdb9cd0619da6f570e5ad1330f498199d89a4bea9e60ea32b8004f8796581",
            "0x481645366e47224457043d354bd9fac3a0d342d85fa3489b8ba2c4c95ad06e79",
            "0x3aa5be2e84dd1eb17f1eacf4c8922d622c38c6893afb371e953818bb18085073",
            "0x4d70545132c47146f6ba915aac0e550f1458148c4242f6c73b11d3bdfb43242f",
            "0x18d74382159845c6e1b3fe17512ba167aa2314495b0af6f6648caf0bc9cf02d9",
            "0x965a698cd7a04d50b9421b1719305cb932e3fa60b7efa4e7947309809e4bf89f",
            "0x98af2e3b23bbca8448a3a3a0275890c4841b74953c2c3ff7de3f60146014022b",
            "0x14b6ce018d72dbc4bf9696fca2450a67a3ec30b83d7f3f29b5705a9b11cf0023",
            "0x5b6aaf14c07490e42422da3090c1f96b75f621b883155815f39fcc62e52b33f4",
            "0xc771676cdb93ec14b0d8cbf595dc71201d6dc8d0e7eac292516883515da9853e",
            "0x77f8b676af27863e5c209de3b83c6b28548ef8f9e2ac8dbbb811c72426ce1314",
            "0xe6c20952ac5828c60e0fdf6ac90a5265dd37d82d07efb994abad8a394d0c09af",
            "0xa3120d24651113f14068b578b321a2932729607f910629dcaf98e5468ce269eb",
            "0xecee7c812393be6a0c8674f1753e1036e8ae94aa65e1554826fbe70117fa3864",
            "0x2b4e80afa71c648ea44b68571b1d49dbbd8ec43d6ed7c0c50497e4dada79b7cf",
            "0xefc09f41c36293ff1054cbef26b2100343234b162def2d9958b6cf7f178be2e1",
            "0x36fb9e07cebde3bfd5428c264cf7a48a53ff4335821e94a4453a74e21926fdab",
            "0xc2d7ed094cac9adeafcee17d6108528d605afb3cab55f4e2be2698ab7a2be42c",
            "0x94bd0c645445a3066db377e7805e9adbfcc7e1bbd03d431b93ed6afdb413f524",
            "0x644d39762057df05ef6d81c6091e28696540336f30fbe38e8f77fb02adeb14dd",
            "0xa0335e5efcb94ae2fd7065a7d0b4e6480d24a55eef2db3adbe7e56f4a10f885e",
            "0x70cc6a56f1578efc21747421e3c65dfbdd64b9d045b035eb2270c099c90fc7ce",
            "0xd6da75a688304dff7f987d3b6be703bcebe9926184e57c85e1e20cba53bdcc6c",
            "0x60c676a4bb996f4d8767649a9cc2d5d53ab5d3f50fa80867e147911f20686c43",
            "0x3905355abddf0be3f4c3213420a81a080f6a9eda1f0014ae5f5a0bdd1a90a696",
            "0x94e65d80b8dd755f8ea3f6e7ba385a1b598f6edc52b7f08e3df445717d795cf7",
            "0xe078055c7d78bb0473914d62ae8dbb557c3fec7b3a7c5d757169823c89729e2f",
            "0xcbadc3ca4a1881c2640558e7d60a3e8c7c753281836eeecd856737087a295431",
            "0xd002e072a411c84b48c37d21ff7df3c41b62172f0dc094d5497b565818459fdb",
            "0x2a63ee7e01b3b54691e0bbc03b2fe641202d3d22dd0c48c2348d1e93ad7b0492",
            "0xe10b19b8956908c1e554b53dbf1e52424de31ff75008fe4ac9f8b3a9db9504fe",
            "0x7925eb0a9767c6e05e39118e799245f68026eb93a094fa9b24404fdd1bd9926c",
            "0xbe5dc882a0ffeee04731180dec24ed1ac1d49393e742470f163c83a0e5147ccd",
            "0x91b44316445eac651a9692dfe324e91b57b9ddb544c8961643fbaecaadd4ed0a",
            "0x0ce80c94b4783a3e5f8ad97619fc6a74ece81f1728712502a1c5089076e370fe",
            "0xdb359e8c4805e64256bf706b3921547d666f7a82efe2e6be099f22a966ea5a3f",
            "0x76bf7b5b3fe06055a4a14368a7ca4a84f8ba80f5ac17f26ec747ed596a0a4e94",
            "0xa7e4e10a4d52ee6e151ca74bc68ee7fb6868d22cf94a67cf75468d1a4d0382e5",
            "0x6fee722066f0556812667007cd3e38176ca66821932e437d9bdf2d98434102fc",
            "0x9085a6a8def5f6c3a25d6e036829807cd5b0695268a4c645f01165021bad1d24",
            "0xf2849a8fb3ad7cd02171d076ccb1fc2fba8732e116734fc72158fa97d6cfb6df",
            "0x03d78a43ef4db904736b09ec8167deacf78ca14b0bcfa22d280c8db53688563a",
            "0x6c962a3376c5d50f9a6fbe71c555294bb639192aaedc6d8ff1f43c2e6c7f6255",
            "0x432d13a977ea8df24859c70f1eeebd303d0ac099d7da6df4bd7db2e2802bdeb1",
          ],
          "transactionsRoot": "0xc103e60e253c07da5e7666463768a0029d50721bfcc06ce51d868c07caf5f4cc",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12761ee",
              "index": "0x4e822fb",
              "validatorIndex": "0x2f2b3",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x127530f",
              "index": "0x4e822fc",
              "validatorIndex": "0x2f2b4",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x127b3a1",
              "index": "0x4e822fd",
              "validatorIndex": "0x2f2b5",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126d432",
              "index": "0x4e822fe",
              "validatorIndex": "0x2f2b6",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1271a9d",
              "index": "0x4e822ff",
              "validatorIndex": "0x2f2b7",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12704a9",
              "index": "0x4e82300",
              "validatorIndex": "0x2f2b8",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126c493",
              "index": "0x4e82301",
              "validatorIndex": "0x2f2b9",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12785a7",
              "index": "0x4e82302",
              "validatorIndex": "0x2f2ba",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1271a3d",
              "index": "0x4e82303",
              "validatorIndex": "0x2f2bb",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1276002",
              "index": "0x4e82304",
              "validatorIndex": "0x2f2bc",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126f825",
              "index": "0x4e82305",
              "validatorIndex": "0x2f2bd",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1275945",
              "index": "0x4e82306",
              "validatorIndex": "0x2f2be",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1270e42",
              "index": "0x4e82307",
              "validatorIndex": "0x2f2bf",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x1270989",
              "index": "0x4e82308",
              "validatorIndex": "0x2f2c0",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x12757f2",
              "index": "0x4e82309",
              "validatorIndex": "0x2f2c1",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x1276b9f",
              "index": "0x4e8230a",
              "validatorIndex": "0x2f2c2",
            },
          ],
          "withdrawalsRoot": "0x33747cc6d2692bffa01c25aab8323b628778f1e9456cfacea32efb81a17c445a",
        },
      }
    `)
    expect(rpcClient.requests.size).toBe(0)
    rpcClient.close()
  })

  test('invalid request', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await expect(
      new Promise<any>((resolve, reject) =>
        rpcClient.request({
          body: {
            method: 'wagmi_lol',
          },
          onError: reject,
          onResponse: resolve,
        }),
      ),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 7,
        "jsonrpc": "2.0",
      }
    `,
    )
    expect(rpcClient.requests.size).toBe(0)
  })

  test('invalid request (closing socket)', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await wait(1000)
    rpcClient.close()
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          rpcClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":9,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
    await wait(100)
  })

  test('invalid request (closed socket)', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    rpcClient.close()
    await wait(1000)
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          rpcClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":11,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
  })
})

describe('request (subscription)', () => {
  test('basic', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const data_: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => data_.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.subscriptions.size).toBe(1)
    expect(data_.length).toBe(3)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(data_[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.subscriptions.size).toBe(0)
    expect(data_.length).toBe(3)
    rpcClient.close()
  })

  test('multiple', async () => {
    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const s1: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s1.push(data),
    })
    const s2: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s2.push(data),
    })
    const s3: RpcResponse[] = []
    rpcClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
      },
      onResponse: (data) => s3.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(500)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(3)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(3)
    expect(s3.length).toBe(1)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s1[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(2)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s2[0] as any).result],
      },
    })
    await rpcClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s3[0] as any).result],
      },
    })
    await wait(2000)
    expect(rpcClient.requests.size).toBe(0)
    expect(rpcClient.subscriptions.size).toBe(0)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    rpcClient.close()
  })

  test('invalid subscription', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    let err_: RpcResponse | undefined
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['fakeHeadz'],
      },
      onResponse: (err) => (err_ = err),
    })
    await wait(500)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(0)
    expect(err_).toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 31,
        "jsonrpc": "2.0",
      }
    `)
  })
})

describe('requestAsync', () => {
  test('valid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...version } = await client.requestAsync({
      body: { method: 'web3_clientVersion' },
    })
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.0.0",
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const { id, ...block } = await client.requestAsync({
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(anvilMainnet.forkBlockNumber), false],
      },
    })
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x227fec6b",
          "blobGasUsed": "0x0",
          "difficulty": "0x0",
          "excessBlobGas": "0x20000",
          "extraData": "0xd983010e0d846765746889676f312e32322e3131856c696e7578",
          "gasLimit": "0x224c7ad",
          "gasUsed": "0x3d9ddc",
          "hash": "0xe84f123bd1dbb0bc21807a48079e21d5a3ee68b9629ab72d889436e8de57e919",
          "logsBloom": "0x906108000108400000818203842012000420102940210030628000400812208410710804220810002000050240124991460900518c0b825600a3228004284d484d01204409048110c88040181060a4e404000010c140480410100408800002146820180002c3402104088390104028821080440a04100c009a10003400051261b0100444000020004314006810306010020b04814526000c90408840281004921a214200301029c0400288e00001280c341080820840088024280402004060410202101a6300010040000818110c024480146009020000346808001a080860020510301000800024008000510480000190002100010c04c00040018408000c41",
          "miner": "0x388c818ca8b9251b393131c08a736a67ccb19297",
          "mixHash": "0xab048d1aba06968cf2a054968593c88d54edf4a8c303a7bf045d9a55d655ab07",
          "nonce": "0x0000000000000000",
          "number": "0x1527101",
          "parentBeaconBlockRoot": "0xa3c571522029f61c8a3ab34a6683b461ebcebbae0786a597babb69cc479c7c88",
          "parentHash": "0x0c594782f0363fc69f546a34c6dfd2d51aca62a6348dd2432243eb9c65b8c14a",
          "receiptsRoot": "0x02e8fada9484c1c30d5eba8ee6516b49e703db0ed25f4dc494b67d7580f64739",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x4b5e",
          "stateRoot": "0xb72df164d58ca907fbd8593cd0c1a2b2f985745bf76f905a6a09abbaee4669b4",
          "timestamp": "0x67ecf833",
          "transactions": [
            "0x854722bdc63c7b3a389391c88cf8ba8215a78348e57fc1cc12fd0ab5281ddbee",
            "0x02cae7161a4e06197ae0178b4875299932bbb88bb7722b8d45dd4be10ed78c98",
            "0xb7d723dfdbd3c3bab81060b438bd87bcf07914753d39e2a0faddb87066e7944f",
            "0x4787c0f5ee67cb10805c4e9cc81ea5f7037a7eda4e93ef145ae4c2fecf03f660",
            "0x59ff041e644a7294cf79da092f65af4329ea6cabe88bd1df53d0ab4518cc518f",
            "0x5520923d4abe5a7a1eb9d481eba9a69740fabdf95b3aae9594a8c1005f5424b6",
            "0x4f547ae4274b602dff5cde7a7fa962bd451e639ba2b856c903009f831715aa56",
            "0x83bce88701a89e0df991dacc817ecb31671a8aa06e0725aceaf2e03f93258237",
            "0xb56128d1a930d85d529f05a8a01ab8ac31341be758c4f733ba13b32ebc2a4cea",
            "0x01886366db19111106a42f7a3fce8d3a31266e72478403c901c9b59bf2bd01dc",
            "0xa2f08cebd167a4cae54c5e2d6907b5e2d49739ca3881214c49e58a37bf6e9455",
            "0xf4174f3311480a400f9a7d8960c7440c186e1beedf2dc946f81a87b0d48d235a",
            "0xcf8b1cd812489193f99cee59d558364ce36593bc89bbc174851d173897241180",
            "0xfb0267c2413094f54a4cc4e913e6fc384ef2ea31bd15b5371d1be17206f41602",
            "0x5ee9e22b89405c490d938e8904d8f50e5788cb400f6f8f89523227eddf8b0629",
            "0xbd808d6736b93870c1a81cb944b444ec02611d85136647c090502ce86bf9c923",
            "0x18c1c967ff87ae710de86210a32e13999509aeaa1472296c17faefe145c53f91",
            "0xfc759550f99be38b1a938f3bd26267353828476e7f5a8dabebb676f710f380de",
            "0x4019b7b381fa1daadad90b4b6d2e02de07eb1e8d6f0b36bb14b62f2e85fe9efa",
            "0xd2bac5f3c8d0b8ea1efc84fea5b7c92ac1369f9b7be90527ffbbb35d35aca077",
            "0xfd69918724b556e832e85e22a359891e08fcab37f4e6c70a8ff1699176e15453",
            "0x50a7e4b5697b0df1bb4a6bbf97321bb94a996fea894aa071fc210a7423cf4838",
            "0x1af867463b10a71305740219c1fab218571d88f5b75472ad8c25885cbfc01b91",
            "0x5c67e0c7ab694c4714576ff54d2bd2dc6b19dcd55df337ceb72bfcc89034becf",
            "0x2b917db8c9adbdd78fd0bab4edf8f599c2ac99c8b6171b1dc3fc42bc3607d164",
            "0xa15e4bca5ac39a8d3023dad307b3743f801baefba07f203f98429c71cf2d2582",
            "0x8cb6e16ecc5d6b659170423b6e5bb39ccd6933ca214c843ba079ad6306111000",
            "0x269f116d71f5886f59dbfb63ea5a1d4621afc6e6f163f984fd4d1a6c33ebdddc",
            "0x2129b8e7f727a14b793959c5a812ad3ad65c6dfd2b4d41944baa40c56bec0312",
            "0xa026091fa779b2fa5a05afdc01b9af8c618e936ee237274f500ca4b07761b6a3",
            "0x1af67c12db72606b9687d413fd3b9a7960e78d38df615e9e8094192055f9f8ba",
            "0xf00dd3ad522918ff5af7fd8eb85946736d119e5ae560bc5339d3197d03a27c25",
            "0xa196faa90844cc30ed6e48f31e5f5e44415c0a9ce605b5537c80fbc8c597c2eb",
            "0x9b01070b12d11f4e980a37ae00716f58c0ef45482984e21219011e8c96c3359a",
            "0xb20c352eb48b4b0166a64d947b9bf43a0a6da5c3f6f61742725e3ac692d351b5",
            "0xaacc6e6b9ca5935a28cdc115ec187a093031c8f071785b1077525ad62caff8ef",
            "0xee8bfcf3180572c02cbd7d7a0a60d616d58a5a689057a23e38e78aea2980a481",
            "0xba86efff334626a0abef6b52be7648ab073049636d6bca087b473d2e24353103",
            "0x8a3eba30e9d148a217434f2951882d8a620a0a37fddbfef7063c4c0914d33712",
            "0xec9ebbe6e1855f3b9f6e20be38bde066e353bd35604e43a96a24e65e6760781c",
            "0x86df945e7311b1b341f2ebfd3ad7979d5dec093a3de6e89a7233374129b6df1a",
            "0x63870fcb38ea65b28ec381a48c49ae92477662bea9ae78c8a88fff309adb596a",
            "0x6711b81447f1f43eab0609e4f3281b421c8252cd3e95252f2843f2666f916e67",
            "0x053cdb9cd0619da6f570e5ad1330f498199d89a4bea9e60ea32b8004f8796581",
            "0x481645366e47224457043d354bd9fac3a0d342d85fa3489b8ba2c4c95ad06e79",
            "0x3aa5be2e84dd1eb17f1eacf4c8922d622c38c6893afb371e953818bb18085073",
            "0x4d70545132c47146f6ba915aac0e550f1458148c4242f6c73b11d3bdfb43242f",
            "0x18d74382159845c6e1b3fe17512ba167aa2314495b0af6f6648caf0bc9cf02d9",
            "0x965a698cd7a04d50b9421b1719305cb932e3fa60b7efa4e7947309809e4bf89f",
            "0x98af2e3b23bbca8448a3a3a0275890c4841b74953c2c3ff7de3f60146014022b",
            "0x14b6ce018d72dbc4bf9696fca2450a67a3ec30b83d7f3f29b5705a9b11cf0023",
            "0x5b6aaf14c07490e42422da3090c1f96b75f621b883155815f39fcc62e52b33f4",
            "0xc771676cdb93ec14b0d8cbf595dc71201d6dc8d0e7eac292516883515da9853e",
            "0x77f8b676af27863e5c209de3b83c6b28548ef8f9e2ac8dbbb811c72426ce1314",
            "0xe6c20952ac5828c60e0fdf6ac90a5265dd37d82d07efb994abad8a394d0c09af",
            "0xa3120d24651113f14068b578b321a2932729607f910629dcaf98e5468ce269eb",
            "0xecee7c812393be6a0c8674f1753e1036e8ae94aa65e1554826fbe70117fa3864",
            "0x2b4e80afa71c648ea44b68571b1d49dbbd8ec43d6ed7c0c50497e4dada79b7cf",
            "0xefc09f41c36293ff1054cbef26b2100343234b162def2d9958b6cf7f178be2e1",
            "0x36fb9e07cebde3bfd5428c264cf7a48a53ff4335821e94a4453a74e21926fdab",
            "0xc2d7ed094cac9adeafcee17d6108528d605afb3cab55f4e2be2698ab7a2be42c",
            "0x94bd0c645445a3066db377e7805e9adbfcc7e1bbd03d431b93ed6afdb413f524",
            "0x644d39762057df05ef6d81c6091e28696540336f30fbe38e8f77fb02adeb14dd",
            "0xa0335e5efcb94ae2fd7065a7d0b4e6480d24a55eef2db3adbe7e56f4a10f885e",
            "0x70cc6a56f1578efc21747421e3c65dfbdd64b9d045b035eb2270c099c90fc7ce",
            "0xd6da75a688304dff7f987d3b6be703bcebe9926184e57c85e1e20cba53bdcc6c",
            "0x60c676a4bb996f4d8767649a9cc2d5d53ab5d3f50fa80867e147911f20686c43",
            "0x3905355abddf0be3f4c3213420a81a080f6a9eda1f0014ae5f5a0bdd1a90a696",
            "0x94e65d80b8dd755f8ea3f6e7ba385a1b598f6edc52b7f08e3df445717d795cf7",
            "0xe078055c7d78bb0473914d62ae8dbb557c3fec7b3a7c5d757169823c89729e2f",
            "0xcbadc3ca4a1881c2640558e7d60a3e8c7c753281836eeecd856737087a295431",
            "0xd002e072a411c84b48c37d21ff7df3c41b62172f0dc094d5497b565818459fdb",
            "0x2a63ee7e01b3b54691e0bbc03b2fe641202d3d22dd0c48c2348d1e93ad7b0492",
            "0xe10b19b8956908c1e554b53dbf1e52424de31ff75008fe4ac9f8b3a9db9504fe",
            "0x7925eb0a9767c6e05e39118e799245f68026eb93a094fa9b24404fdd1bd9926c",
            "0xbe5dc882a0ffeee04731180dec24ed1ac1d49393e742470f163c83a0e5147ccd",
            "0x91b44316445eac651a9692dfe324e91b57b9ddb544c8961643fbaecaadd4ed0a",
            "0x0ce80c94b4783a3e5f8ad97619fc6a74ece81f1728712502a1c5089076e370fe",
            "0xdb359e8c4805e64256bf706b3921547d666f7a82efe2e6be099f22a966ea5a3f",
            "0x76bf7b5b3fe06055a4a14368a7ca4a84f8ba80f5ac17f26ec747ed596a0a4e94",
            "0xa7e4e10a4d52ee6e151ca74bc68ee7fb6868d22cf94a67cf75468d1a4d0382e5",
            "0x6fee722066f0556812667007cd3e38176ca66821932e437d9bdf2d98434102fc",
            "0x9085a6a8def5f6c3a25d6e036829807cd5b0695268a4c645f01165021bad1d24",
            "0xf2849a8fb3ad7cd02171d076ccb1fc2fba8732e116734fc72158fa97d6cfb6df",
            "0x03d78a43ef4db904736b09ec8167deacf78ca14b0bcfa22d280c8db53688563a",
            "0x6c962a3376c5d50f9a6fbe71c555294bb639192aaedc6d8ff1f43c2e6c7f6255",
            "0x432d13a977ea8df24859c70f1eeebd303d0ac099d7da6df4bd7db2e2802bdeb1",
          ],
          "transactionsRoot": "0xc103e60e253c07da5e7666463768a0029d50721bfcc06ce51d868c07caf5f4cc",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12761ee",
              "index": "0x4e822fb",
              "validatorIndex": "0x2f2b3",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x127530f",
              "index": "0x4e822fc",
              "validatorIndex": "0x2f2b4",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x127b3a1",
              "index": "0x4e822fd",
              "validatorIndex": "0x2f2b5",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126d432",
              "index": "0x4e822fe",
              "validatorIndex": "0x2f2b6",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1271a9d",
              "index": "0x4e822ff",
              "validatorIndex": "0x2f2b7",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12704a9",
              "index": "0x4e82300",
              "validatorIndex": "0x2f2b8",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126c493",
              "index": "0x4e82301",
              "validatorIndex": "0x2f2b9",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x12785a7",
              "index": "0x4e82302",
              "validatorIndex": "0x2f2ba",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1271a3d",
              "index": "0x4e82303",
              "validatorIndex": "0x2f2bb",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1276002",
              "index": "0x4e82304",
              "validatorIndex": "0x2f2bc",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x126f825",
              "index": "0x4e82305",
              "validatorIndex": "0x2f2bd",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1275945",
              "index": "0x4e82306",
              "validatorIndex": "0x2f2be",
            },
            {
              "address": "0xcaf3b970b4596391cf74a1fa833d0c9edd71470c",
              "amount": "0x1270e42",
              "index": "0x4e82307",
              "validatorIndex": "0x2f2bf",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x1270989",
              "index": "0x4e82308",
              "validatorIndex": "0x2f2c0",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x12757f2",
              "index": "0x4e82309",
              "validatorIndex": "0x2f2c1",
            },
            {
              "address": "0xa9290b61d99562a213428d2d972420acd0077c21",
              "amount": "0x1276b9f",
              "index": "0x4e8230a",
              "validatorIndex": "0x2f2c2",
            },
          ],
          "withdrawalsRoot": "0x33747cc6d2692bffa01c25aab8323b628778f1e9456cfacea32efb81a17c445a",
        },
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('serial requests', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await client.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [
              numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
              false,
            ],
          },
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
      ),
    )
    expect(client.requests.size).toBe(0)
  })

  test('parallel requests', async () => {
    await wait(500)

    await mine(client, { blocks: 100 })
    const blockNumber = await getBlockNumber(client)

    const rpcClient = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    const response = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        return await rpcClient.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(blockNumber - BigInt(i)), false],
          },
        })
      }),
    )
    expect(response.map((r) => r.result.number)).toEqual(
      Array.from({ length: 100 }).map((_, i) =>
        numberToHex(blockNumber - BigInt(i)),
      ),
    )
    expect(rpcClient.requests.size).toBe(0)
    await wait(500)
  }, 30_000)

  test('invalid request', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)
    await expect(
      client.requestAsync({
        body: {
          method: 'wagmi_lol',
        },
      }),
    ).resolves.toThrowErrorMatchingInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 151,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test.skip('timeout', async () => {
    const client = await getIpcRpcClient(anvilMainnet.rpcUrl.ipc)

    await expect(() =>
      client.requestAsync({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(5115n), false],
        },
        timeout: 10,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
        [TimeoutError: The request took too long to respond.

        URL: http://localhost
        Request body: {"method":"eth_getBlockByNumber","params":["0x13fb",false]}

        Details: The request timed out.
        Version: viem@x.y.z]
      `,
    )
  })
})

describe('extractMessages', () => {
  test('default', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from('{"jsonrpc":"2.0","id":1,"result":1}'),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })

  test('remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from('{"jsonrpc":"2.0","id":1,'),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot('[]')
    expect(remaining.toString()).toMatchInlineSnapshot(
      `"{"jsonrpc":"2.0","id":1,"`,
    )
  })

  test('multiple, no remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '{"jsonrpc":"2.0","id":1,"result":1}{"jsonrpc":"2.0","id":2,"result":1}{"jsonrpc":"2.0","id":3,"result":1}',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":1}",
        "{"jsonrpc":"2.0","id":3,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })

  test('multiple, remainder', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '{"jsonrpc":"2.0","id":1,"result":1}{"jsonrpc":"2.0","id":2,"result":1}{"jsonrpc":"2.0","id":3,"result":1}{"jsonrpc":"2.0","id":4,"result":{{{}}',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":1}",
        "{"jsonrpc":"2.0","id":3,"result":1}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(
      `"{"jsonrpc":"2.0","id":4,"result":{{{}}"`,
    )
  })

  test('whitespace', () => {
    const [messages, remaining] = extractMessages(
      Buffer.from(
        '  {"jsonrpc":"2.0","id":1,"result":1} \n     {"jsonrpc":"2.0","id":2,"result":{"ok": {"ok": "haha"}}}  ',
      ),
    )
    expect(messages.map((m) => m.toString())).toMatchInlineSnapshot(
      `
      [
        "{"jsonrpc":"2.0","id":1,"result":1}",
        "{"jsonrpc":"2.0","id":2,"result":{"ok": {"ok": "haha"}}}",
      ]
    `,
    )
    expect(remaining.toString()).toMatchInlineSnapshot(`""`)
  })
})
