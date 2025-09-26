import { WebSocket } from 'isows'
import { describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { mine } from '../../actions/test/mine.js'

import type { RpcResponse } from '../../types/rpc.js'
import { numberToHex } from '../encoding/toHex.js'
import { wait } from '../wait.js'
import { getWebSocketRpcClient } from './webSocket.js'

const client = anvilMainnet.getClient()

describe.runIf(process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')(
  'getWebSocketRpcClient',
  () => {
    test('creates WebSocket instance', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      expect(socketClient).toBeDefined()
      expect(socketClient.socket.readyState).toEqual(WebSocket.OPEN)
    })

    test('multiple invocations on a url only opens one socket', async () => {
      const url = 'ws://127.0.0.1:8545/69420'
      const [client1, client2, client3, client4] = await Promise.all([
        getWebSocketRpcClient(url),
        getWebSocketRpcClient(url),
        getWebSocketRpcClient(url),
        getWebSocketRpcClient(url),
      ])
      expect(client1).toEqual(client2)
      expect(client1).toEqual(client3)
      expect(client1).toEqual(client4)
    })

    test('reconnect', async () => {
      const socketClient = await getWebSocketRpcClient(
        'ws://127.0.0.1:8545/69420',
        {
          reconnect: { delay: 100 },
        },
      )
      expect(socketClient).toBeDefined()
      expect(socketClient.socket.readyState).toEqual(WebSocket.OPEN)
      socketClient.socket.close()
      await wait(500)
      expect(socketClient.socket.readyState).toEqual(WebSocket.OPEN)
    })

    test('keepalive', async () => {
      const socketClient = await getWebSocketRpcClient(
        'ws://127.0.0.1:8545/69421',
        {
          keepAlive: { interval: 100 },
        },
      )
      const spy = vi.spyOn(socketClient.socket, 'ping')
      await wait(500)
      expect(spy).toHaveBeenCalledTimes(4)
    })

    test('subscriptions persist after reconnect', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws, {
        reconnect: { delay: 100, attempts: 5 },
      })

      // Set up subscription tracking
      const subscriptionResponses: RpcResponse[] = []

      // Create a subscription
      await new Promise<void>((resolve) => {
        socketClient.request({
          body: {
            method: 'eth_subscribe',
            params: ['newHeads'],
          },
          onResponse: (data) => {
            if (data.result) resolve()
            else if (data.method === 'eth_subscription')
              subscriptionResponses.push(data)
          },
        })
      })

      // Verify subscription is active
      expect(socketClient.subscriptions.size).toBe(1)

      // Mine a block to trigger subscription notification
      await mine(client, { blocks: 1 })
      await wait(200)

      const responsesBeforeDisconnect = subscriptionResponses.length
      expect(responsesBeforeDisconnect).toBeGreaterThan(0)

      // // Simulate connection drop by closing the socket
      const originalSocket = socketClient.socket
      originalSocket.close()

      // // Wait for reconnection
      await wait(300)

      // Verify socket has reconnected
      expect(socketClient.socket.readyState).toBe(WebSocket.OPEN)

      // Mine more blocks to test if subscription still works
      await mine(client, { blocks: 2 })
      await wait(300)

      // Verify we received new subscription notifications after reconnect
      const responsesAfterReconnect = subscriptionResponses.length
      expect(responsesAfterReconnect).toBeGreaterThan(responsesBeforeDisconnect)

      socketClient.close()
    })

    test('multiple subscriptions persist after reconnect', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws, {
        reconnect: { delay: 100, attempts: 5 },
      })

      // Set up multiple subscriptions
      const blockSubscriptionResponses: RpcResponse[] = []
      const pendingTxSubscriptionResponses: RpcResponse[] = []

      // Create newHeads subscription
      await new Promise<void>((resolve) => {
        socketClient.request({
          body: {
            method: 'eth_subscribe',
            params: ['newHeads'],
          },
          onResponse: (data) => {
            if (data.result) resolve()
            else if (data.method === 'eth_subscription')
              blockSubscriptionResponses.push(data)
          },
        })
      })

      // Create pendingTransactions subscription
      await new Promise<void>((resolve) => {
        socketClient.request({
          body: {
            method: 'eth_subscribe',
            params: ['newPendingTransactions'],
          },
          onResponse: (data) => {
            if (data.result) resolve()
            else if (data.method === 'eth_subscription') {
              pendingTxSubscriptionResponses.push(data)
            }
          },
        })
      })

      // Verify both subscriptions are active
      expect(socketClient.subscriptions.size).toBe(2)

      // Mine a block to trigger subscription
      await mine(client, { blocks: 1 })
      await wait(200)

      const blockResponsesBeforeDisconnect = blockSubscriptionResponses.length
      expect(blockResponsesBeforeDisconnect).toBeGreaterThan(0)

      // Simulate connection drop
      const originalSocket = socketClient.socket
      originalSocket.close()

      // Wait for reconnection
      await wait(300)

      // Verify socket has reconnected
      expect(socketClient.socket.readyState).toBe(WebSocket.OPEN)

      // Mine more blocks to test if subscriptions still work
      await mine(client, { blocks: 2 })
      await wait(300)

      // Verify both subscriptions received new notifications after reconnect
      const blockResponsesAfterReconnect = blockSubscriptionResponses.length
      expect(blockResponsesAfterReconnect).toBeGreaterThan(
        blockResponsesBeforeDisconnect,
      )

      socketClient.close()
    })
  },
)

describe.runIf(process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')(
  'request',
  () => {
    test('valid request', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const { id, ...version } = await new Promise<any>((resolve) =>
        socketClient.request({
          body: { method: 'web3_clientVersion' },
          onResponse: resolve,
        }),
      )
      expect(id).toBeDefined()
      expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.3.6",
      }
    `)
      expect(socketClient.requests.size).toBe(0)
    })

    test('valid request', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const { id, ...block } = await new Promise<any>((resolve) =>
        socketClient.request({
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
          "baseFeePerGas": "0x25e3b018",
          "blobGasUsed": "0xc0000",
          "difficulty": "0x0",
          "excessBlobGas": "0x180000",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x224c7ad",
          "gasUsed": "0xd83b57",
          "hash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
          "logsBloom": "0xa336825265c0691c36791a28c7814901910c6b230e016020408d80135c1980b01016af2c481b78027612ff562ed6c7821228e23a0ccfea2b689d740905656000544085800d0928884ad6e10a344820e9f508517102f601cc0c081464d844b6993b4dd2a082e3462944ca5a4ab4227e8ce368046230b8974506a20496000f111406a9b5004e25a580a0e9204843b3100e18454253b384b508362280d101b634a12f62148431086a90625f16a482818f0841bac44db90101000f39c532160c7460d012000688201ea0013a33920e7b384728250356c52700955c3e2bc20891e2c62572a843e142470000051461200009428f79b8428b08a4c04b899412204954a5",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x33fd71ca8e38da7aa264c9b9252b7d2864484826eeeae67c2aaf3ab0a756f133",
          "nonce": "0x0000000000000000",
          "number": "0x153b747",
          "parentBeaconBlockRoot": "0xa7b4e889e408381f1860000a708b6e5fd42ccd9de7fb1cb442a8e91ecb9e6f6c",
          "parentHash": "0x019d374731477005b8d3e3236aca44d11ef53fc9eb0ab0c9e11f942636b04b1b",
          "receiptsRoot": "0x230fa17d30bd0ca83606cd4704400735bf05cd09110bc96eeee7dbfbc0f870c9",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x1595e",
          "stateRoot": "0xadea44d9167ee7c415601810dbb3f090de70edfdea34632b7e077cefad038af3",
          "timestamp": "0x67fc55db",
          "transactions": [
            "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "0xec8dae0c3c87e84115d6d80a13f18fa09149b26b6185dec8b1feb9277f57de16",
            "0x6bdee6726ede49f0caedbb039559a3ecbeb30beccdbad0d0ad34b7878fd76756",
            "0xec27e6ef7e8e0c5e495d978e2409f18d09efbac99f6a1d9766e8951eb20c1bb6",
            "0x388f16334f1217cf27bbefcc8798834af13166cd7857b5c56892b1ebeef6c708",
            "0x10f56c635bde3733b330e41fe1dedd83c303dbef4b713a87ad1fb0feda79a5e1",
            "0x0b20063113f3377255f2d1fe4e3277feadaa98d122ebdfa4f08b2e58113c3bf2",
            "0xa418d5bd350d6a7947d5801cfcda9aa9068cf43611cc5ec26a3e0996b3e6b1e0",
            "0xcdb2fcead0254ce044d050761b3308f9fafb1bc419a8ca9a6dc4b3e62c437169",
            "0x1b1e60b3aa4031704fae193d7f97a5484a1673f5ba2da0ee31e3b0858d839684",
            "0x59917ed06b3fa39d2d311086d6032e2abe1341a31db2422e9467afad00fabfe4",
            "0x185f39d2b7b2cbe0c0950ddc45df5948e167bbbceab235ae2b18193ccdbf3cf7",
            "0x9aa22d79c11e83cecc8043528527d9c88a62d6103ca8f250aa8cb86eca02eb11",
            "0xf914ecdf0c1922a1bd4effe4d2f15adaebea229b7b52ad610984a979ea09e565",
            "0x27feb453dd1e91b41d5860c32ac34470d101f6e5da57c57c4e0c074c5d00cd5d",
            "0x069bf514fa826397e81c88d4587530538e10baeb5e0388048030287d85b2b5f9",
            "0x6c89d2775e9919fe8afde564755021b2291a797490e7d64a42231cd0e9ebec85",
            "0x01975a1e08fac4209e625990cd4a0fbf2fa05e3c08d9e98898a5f50207f36c04",
            "0x5eb6d26ad0d67a9af50cccb5e4d2e7c11e8d9e86fe51c61483cb62b84dd8e2bb",
            "0xb600b487433b17d85b33ae7567e4558698afd3f72a8fa968985ac847055e09bc",
            "0x002dd9d9fc69777dfac9ae0cae8d9b47ece05930f3dc971c23a3e7674629ce72",
            "0x384b2c0059e7ecae49b44dfa6f5ed44fd9fac1dc0fab8c01d341cc886bd45789",
            "0x403412968589902149efd2df44385afa00c4299c52aa83d64008bbee0c953d47",
            "0xb6ef0c02e08374d3cea3eda42b8e08ed218033a70406712c9db64620ebe6ff62",
            "0xca031374a4aa643a169e7edbfa8505b310b52f1559c49f7bb1acbcbd9281f8fe",
            "0xeac0cf72d02033c8d24dd22ca23882773402f8791f57d9e3f161b1086cea39bf",
            "0x7ac526702bccafe985f08a35ab96250066f230bfa4c589696d52f388dc28cd9b",
            "0x7663feb1a75df42652c26c6c114d711956b03de8aada2493e8e858bc19163f18",
            "0x7dd2137fdb2f69d3714bbd8cdc1be5ad0a4503ddfe19ffb8e752ee3537a6baab",
            "0x88608458416217eb145836116357017d8ee7f0bff8f18e2a708b578645b115f7",
            "0x03037c03f30232ed8b486ee3e43212f40d7e48317c733fad92034850420a29c6",
            "0x96c58606a41010569c74160b3ff879948d4e254f305df63491dfb77637bb6fcb",
            "0xc6391d3137b9937cc53e7044c7fde0e9e3d37ff3e2ce3e2c2daa40a1e855e8d6",
            "0x126acf8dea4af4f8477d83fd40096277b8f46be7ce6f48c3f5ce12c73dbea9e2",
            "0x5a3bb37a3859bfc316580c2c3016e0a602cc578e518fff5a1ca560cc3d457ff5",
            "0x30c1bdd22384b8a1187dc5c30fe0aed454e1bbe724fad44e619fcf26287455a5",
            "0xd664ff7bd195031873ab12bfddc3399bcab5a5e5e6b66e0ec9e7aca5eea533b9",
            "0x52353a3786a5bc637d2a767d440a13ac426ae372301882a69cf99be5c08b9b34",
            "0x8640c1cb3208b965e5405b952d4400f76ba5942640b6ff75559411d567c6624b",
            "0xfc401c21638aeb2b853bb0e29bae2468fe6d757e76f455a0e00061301d243692",
            "0xced23b981bc2fd12d5b45b8ae3f5b0effbb21cadc2d6431f677621ec8023ffc2",
            "0x2b63a9e4d7d27a19ad8c84e2035b0bc5e1e2f61ceb53ad9fa7569f639bff78ec",
            "0x9991c76fa2ba076162f0b8d21b9b2a6b2b9fe9dd5403dd6a4a05a72c85569a03",
            "0x9a3a09b54dcae0cfe70d12a5d675f7e400d3f6d5c3b43ec018c7c1f587584ff4",
            "0x848d7a6be7e269ee54437dc0272501e3aba635ad277903abafd75a21652ebde3",
            "0xf4afe5774ac8d7196ad36103769ef606faa8a1c70284b609d5993db3c99773ee",
            "0xdb2cc3a2dd936e22f3cccdacd3a95d6541070e2a0a9440b68d5b17036c791e25",
            "0xdfc82c9edf56322fc2b2b42c49b4053fada87559d4269dc7f62df2043dff0391",
            "0x6d4131a2c049efb6cbe31fcdc03aba6952875efbc8df336b915aea67a6d17cfa",
            "0xc469810e7856cf8d1f748f2e5f8f80084253272019056b69474d0f10ff181ece",
            "0x313e76bb4c1d58dd51df593e00369185d3612a660f67d5a3751bc341585b1eb4",
            "0x6baf070c42ec0033ff0b0dec233c4ce7ab4f8b94369f67d02a6eb1a48ca6dff9",
            "0x7544a200cb8855073410e2ef14666a2846f9e3c962fd68ab060bc63b2bf376f8",
            "0xb6ca49f11c2be3541178e6896b98bf47b7c392e20c8c4c9e8dfc439ba7d34d37",
            "0x5252bea73f0cb25d0096362e39faf73dd86eb1d1de8449bacf4aa7da96eaec4e",
            "0x666875fa51d4cabf200b63db9b7c3110c593c60658f9ee174181ed7790a6f6de",
            "0x68dd0295bf7d2f0d636ebc5d551db39132b3c8dc2374c1382a3a91d753cc93f7",
            "0x4dbf6d86b0c8f87589b44fa8b8986684febb58815be0fb51bb5ab4904c3dd816",
            "0xf5dac89d6f756e8e0728993f91420f883658306974b85df38d86dab3b1b66522",
            "0x1929a2dd505f80e1d883eeaaccd09c3392e5d9ff0d42ebdf869bb413e72ae406",
            "0x43c076bffb1b83e9208776bdc63b8e52ca2957c0f53966f0d388d97fe90ab84f",
            "0x67abe41b249287654a1e34d15f386a11fb384dcb406ad179b7b6b6e2c66fbc58",
            "0x8a8a45cea8595016bcad108c281ee8612cb0f6d4397d368315488feaa5f798d3",
            "0x11592924727a9175d05e57635dc4b7eef9bebf67da90d590adeb3f2f27d3f4f4",
            "0x8d816313b6dd7524ec3a22f82edee1aeb147a8468824c29bf48b53d2dc78a160",
            "0x180de77173fd1e0a108a191f79edd955e35728d4dc17f00f3eb4f2a5aeb40d53",
            "0x118f5228f1faf3c2301201d0451e578bae7bd7fae9c2aa860a85877fc94065d6",
            "0xd23194a13c3302913bc044b8912f6361dfa997e667a8e00913e1349df04586a4",
            "0x16395ca6eb8963ee04e3181c7233fa417678bc9446bd2602bf5f9b8eeb5b17c4",
            "0x9d50f7dd271dff2451b4021ff75d0e581eae95d67260bc2ddf0c3e06d08b58f6",
            "0xe342270887c85b5a5be6068ca116ebdf4a53ee29f5cbd0b1b6dd9b66f99699ec",
            "0x74960a4a67cbf20e4e660747e16d9c82eff0b614baf34fc98dd125323555e319",
            "0x0ba0a9eb5c3ba2700d70d1cb00dd1ba892205f47883690f5343f0d6e8a012110",
            "0xbdc97aa06937fbb6227deaaf4242c4c136b03f7bf1c466b672c96b1e1994203b",
            "0xccef5dd7738d65689ccfab4ce87431132dcff26c30f1337017c6f2cd2573f121",
            "0xd4b7fa9c33c877ad0e0ca65caf27998e7d32bc3ef9cd351c2c318b294468c8ab",
            "0x676858b075e31a88caf5d84bfb5e8bc8f1fda60c8b47ad6d1510e16025dab1b5",
            "0x467afd1e746c073475d396198420fb504c330bc9759a9d49fb375c3831ccd863",
            "0xc41560172f2c1e5880de04c06bc28872cf1aaf2bf5e86a42979b4ecfcd44d311",
            "0xfc505c0a8009f008433aaf366e7a8a585f66336e77ab3066630552bb8c67a800",
            "0x7454273c2845eea8611fecce8016bcbf7571959a1600c7ac97387ed3510e3582",
            "0xdc856c8d91705f4b3d03964c8ad4befc3799a8849f2d527709432db45d3a388c",
            "0x17d71b1691589e9597fc6d29d571be8d674f86538355806e697af188cb18eea9",
            "0x5f0faee4777596897c3f8b7206ae31fe7ed5d3eb4718cdba07e1e743cda7cc1a",
            "0x7c68af4b9e5c22ce5bcf74929a19180ad06125a80e9118128b653d0056260c58",
            "0xe222040952e6f7fd617290b7b8904b00f81ef49e4fb37be040db1f66f1f4ddc8",
            "0x1ad0b706c9a1d376cde377fb73395ecd5e0e55f428ad3299317806daef8de882",
            "0x4f24aff0b5d7269902fef75cb69ba67aefd39f114f91b0d7a519e86e10d9c8b7",
            "0x32e23029b54b3ffbc78c4e9f115a4cbefe65faf67ec295e2ad9a0603ed44d4de",
            "0xfc424bbd777126fb913242238dafbacdd75344b6fd0f6d524d64f85b7420627d",
            "0x2742143d7f34fa33714619ccf9c1f01f4f32a47ccbf69b6ecff00d398c483cf7",
            "0x81d16e35c2f2372d18b2898778cd9f81eaa0a553b06bcc2620d69d2df39431ac",
            "0x5ff48d7e61c45a9be174bf915f864318123dd16458550322b2fca85490a4c0f6",
            "0xdfedd288385085f2f33a4235d9e65dffca463c555f3ef351f7ac6992360e6980",
            "0xf8e19739eb8068854f9e6a2274a826228896d0e8c56b33ace69199a92385c6e4",
            "0x72c03ec1db7496a464214c3c17c2303d55882ff873ddd42cd9aadd11d6cd4674",
            "0xcd66de6e1ba35f34e0c1ae90d470abba0b39cb798909db5350aaa0414121cfa6",
            "0x647544c734fff0189ab55e86e2a38c78d4764aea12ed0cd16c3dbee9aca5a4c9",
            "0x2fd9010ba8d614a8492c02914bc5aa9504e588ce2b98b7c097eb78c02318f734",
            "0xf9e4ae3673db5a8961fdbd3253643b2f09a475b76a2d3639671bb5b8d8df8599",
            "0x269240fcb4257e6e0b2d970d8a08b06fd56226b0afbc3c41ae952cebd1d1e84d",
            "0x2f9db6986f9d46736e6532030627e0be514e6e7c8d844e316ec589d3e0dbb573",
            "0xeb32497fce6f101f55959ea2ac0b090a0b26032865c74e279754ba13384f2245",
            "0x4257448420523d4320b38aee51ef17e72ad59b316c390267f524dcb51fa1f3e2",
            "0x511ba0618f654bce433edc15ead66c282b9628049398b117c8dea68b5956484c",
            "0xa5ab42e4353a63a1dbbb5fcd9827b0b5784468b4c71074ad5124eb84ea87b687",
            "0x018b3ecb07b3487253f4c6f26c4a66518e5b4127433da45e10f88a458da19932",
            "0x8d9c8a91a8ffb007f20622068d27b3d21e641cf4495bd7791f76eff22bbe3b5a",
            "0xc65564c139b75062f4989cb2eed6c436e6036f281c8c5dfd811911b7575b03bb",
            "0x1fa029e5ff784a280d1d3aa8a0738942ecea6f271d0b3cb852edd2233fbf807b",
            "0x893eb054cc26a7f84904a4c038f8b5ab62b6fd97201526308699c6f750879cb8",
            "0x52150a57b9f7e1b4cd27294a81a27966421a791b11238075818d70683fd716d1",
            "0xb56f65e5aa53351984d177cb0e9099f386c10ad0989255b0dc2818982c08794e",
            "0x2a2b18674d4e5955ead4f4c3ee115e26ccd4f5d16112fc8438ab4424f18ec9bc",
            "0xb30bd6264b27feec0fb74dbf5c0dfbf0c2f6c4e7a69c0c265f3fad84f94f622d",
            "0x30f32b6cefaba17d25b5a8c58cd42c60e19a7f0dd1f16251bfcede5bda55b7bc",
            "0x48c3c9f6a2344284079d4ee6ffc186c5eb36a5a5a88c3c2e256690d6e5a9dc15",
            "0x6a29c02a54d80de73c015bb4f769ec74fdb61e784b0ca07ecb5c88adc0554e4b",
          ],
          "transactionsRoot": "0x5c41008fd93b95aff0a1a453b657539b7e43d67d20c196c87fe59f5f2f1dd214",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x12380f1",
              "index": "0x4fc875b",
              "validatorIndex": "0xbee4f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3f62a7a",
              "index": "0x4fc875c",
              "validatorIndex": "0xbee50",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1256773",
              "index": "0x4fc875d",
              "validatorIndex": "0xbee56",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x125b69c",
              "index": "0x4fc875e",
              "validatorIndex": "0xbee57",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3e33e35",
              "index": "0x4fc875f",
              "validatorIndex": "0xbee58",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1266095",
              "index": "0x4fc8760",
              "validatorIndex": "0xbee59",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1278100",
              "index": "0x4fc8761",
              "validatorIndex": "0xbee5a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127ad22",
              "index": "0x4fc8762",
              "validatorIndex": "0xbee5b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127d890",
              "index": "0x4fc8763",
              "validatorIndex": "0xbee5c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x12612df",
              "index": "0x4fc8764",
              "validatorIndex": "0xbee5d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3e39635",
              "index": "0x4fc8765",
              "validatorIndex": "0xbee5e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x126c872",
              "index": "0x4fc8766",
              "validatorIndex": "0xbee5f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1268edf",
              "index": "0x4fc8767",
              "validatorIndex": "0xbee60",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1267257",
              "index": "0x4fc8768",
              "validatorIndex": "0xbee61",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1269208",
              "index": "0x4fc8769",
              "validatorIndex": "0xbee62",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127534c",
              "index": "0x4fc876a",
              "validatorIndex": "0xbee63",
            },
          ],
          "withdrawalsRoot": "0x96c5c22e9b58cb7141b2aecf4250fc84b0486a00a78353cdcfc9d42c214b2127",
        },
      }
    `)
      expect(socketClient.requests.size).toBe(0)
    })

    test('invalid request', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      await expect(
        new Promise<any>((resolve, reject) =>
          socketClient.request({
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
          "id": 1,
          "jsonrpc": "2.0",
        }
      `,
      )
      expect(socketClient.requests.size).toBe(0)
    })

    test('invalid request (closing socket)', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      await wait(1000)
      socketClient.close()
      await expect(
        () =>
          new Promise<any>((resolve, reject) =>
            socketClient.request({
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
        Request body: {"jsonrpc":"2.0","id":1,"method":"wagmi_lol"}

        Version: viem@x.y.z]
      `,
      )
      await wait(100)
    })

    test('invalid request (closed socket)', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      socketClient.close()
      await wait(1000)
      await expect(
        () =>
          new Promise<any>((resolve, reject) =>
            socketClient.request({
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
      Request body: {"jsonrpc":"2.0","id":1,"method":"wagmi_lol"}

      Version: viem@x.y.z]
    `,
      )
    })

    test('empty message', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)

      // send a malformed message
      const messageEvent = new MessageEvent('message', { data: '' })
      socketClient.socket.dispatchEvent(messageEvent)

      // Send a legitimate message and subscribe to the error event
      await expect(
        socketClient.requestAsync({
          body: { method: 'web3_clientVersion' },
        }),
      ).resolves.toBeTruthy()
    })
  },
)

describe.runIf(process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')(
  'request (subscription)',
  () => {
    test('basic', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const data_: RpcResponse[] = []
      socketClient.request({
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
      expect(socketClient.subscriptions.size).toBe(1)
      expect(data_.length).toBe(3)
      await socketClient.requestAsync({
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
      expect(socketClient.subscriptions.size).toBe(0)
      expect(data_.length).toBe(3)
    })

    test('multiple', async () => {
      const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const s1: RpcResponse[] = []
      socketClient.request({
        body: {
          method: 'eth_subscribe',
          params: ['newHeads'],
        },
        onResponse: (data) => s1.push(data),
      })
      const s2: RpcResponse[] = []
      socketClient.request({
        body: {
          method: 'eth_subscribe',
          params: ['newHeads'],
        },
        onResponse: (data) => s2.push(data),
      })
      const s3: RpcResponse[] = []
      socketClient.request({
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
      await wait(100)
      expect(socketClient.requests.size).toBe(0)
      expect(socketClient.subscriptions.size).toBe(3)
      expect(s1.length).toBe(3)
      expect(s2.length).toBe(3)
      expect(s3.length).toBe(1)
      await socketClient.requestAsync({
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
      expect(socketClient.requests.size).toBe(0)
      expect(socketClient.subscriptions.size).toBe(2)
      expect(s1.length).toBe(3)
      expect(s2.length).toBe(5)
      expect(s3.length).toBe(1)
      await socketClient.requestAsync({
        body: {
          method: 'eth_unsubscribe',
          params: [(s2[0] as any).result],
        },
      })
      await socketClient.requestAsync({
        body: {
          method: 'eth_unsubscribe',
          params: [(s3[0] as any).result],
        },
      })
      await wait(2000)
      expect(socketClient.requests.size).toBe(0)
      expect(socketClient.subscriptions.size).toBe(0)
      expect(s1.length).toBe(3)
      expect(s2.length).toBe(5)
      expect(s3.length).toBe(1)
    })

    test('invalid subscription', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
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
        "id": 1,
        "jsonrpc": "2.0",
      }
    `)
    })
  },
)

describe.runIf(process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')(
  'requestAsync',
  () => {
    test('valid request', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const { id, ...version } = await client.requestAsync({
        body: { method: 'web3_clientVersion' },
      })
      expect(id).toBeDefined()
      expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v1.3.6",
      }
    `)
      expect(client.requests.size).toBe(0)
    })

    test('valid request', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
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
          "baseFeePerGas": "0x25e3b018",
          "blobGasUsed": "0xc0000",
          "difficulty": "0x0",
          "excessBlobGas": "0x180000",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x224c7ad",
          "gasUsed": "0xd83b57",
          "hash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
          "logsBloom": "0xa336825265c0691c36791a28c7814901910c6b230e016020408d80135c1980b01016af2c481b78027612ff562ed6c7821228e23a0ccfea2b689d740905656000544085800d0928884ad6e10a344820e9f508517102f601cc0c081464d844b6993b4dd2a082e3462944ca5a4ab4227e8ce368046230b8974506a20496000f111406a9b5004e25a580a0e9204843b3100e18454253b384b508362280d101b634a12f62148431086a90625f16a482818f0841bac44db90101000f39c532160c7460d012000688201ea0013a33920e7b384728250356c52700955c3e2bc20891e2c62572a843e142470000051461200009428f79b8428b08a4c04b899412204954a5",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x33fd71ca8e38da7aa264c9b9252b7d2864484826eeeae67c2aaf3ab0a756f133",
          "nonce": "0x0000000000000000",
          "number": "0x153b747",
          "parentBeaconBlockRoot": "0xa7b4e889e408381f1860000a708b6e5fd42ccd9de7fb1cb442a8e91ecb9e6f6c",
          "parentHash": "0x019d374731477005b8d3e3236aca44d11ef53fc9eb0ab0c9e11f942636b04b1b",
          "receiptsRoot": "0x230fa17d30bd0ca83606cd4704400735bf05cd09110bc96eeee7dbfbc0f870c9",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x1595e",
          "stateRoot": "0xadea44d9167ee7c415601810dbb3f090de70edfdea34632b7e077cefad038af3",
          "timestamp": "0x67fc55db",
          "transactions": [
            "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "0xec8dae0c3c87e84115d6d80a13f18fa09149b26b6185dec8b1feb9277f57de16",
            "0x6bdee6726ede49f0caedbb039559a3ecbeb30beccdbad0d0ad34b7878fd76756",
            "0xec27e6ef7e8e0c5e495d978e2409f18d09efbac99f6a1d9766e8951eb20c1bb6",
            "0x388f16334f1217cf27bbefcc8798834af13166cd7857b5c56892b1ebeef6c708",
            "0x10f56c635bde3733b330e41fe1dedd83c303dbef4b713a87ad1fb0feda79a5e1",
            "0x0b20063113f3377255f2d1fe4e3277feadaa98d122ebdfa4f08b2e58113c3bf2",
            "0xa418d5bd350d6a7947d5801cfcda9aa9068cf43611cc5ec26a3e0996b3e6b1e0",
            "0xcdb2fcead0254ce044d050761b3308f9fafb1bc419a8ca9a6dc4b3e62c437169",
            "0x1b1e60b3aa4031704fae193d7f97a5484a1673f5ba2da0ee31e3b0858d839684",
            "0x59917ed06b3fa39d2d311086d6032e2abe1341a31db2422e9467afad00fabfe4",
            "0x185f39d2b7b2cbe0c0950ddc45df5948e167bbbceab235ae2b18193ccdbf3cf7",
            "0x9aa22d79c11e83cecc8043528527d9c88a62d6103ca8f250aa8cb86eca02eb11",
            "0xf914ecdf0c1922a1bd4effe4d2f15adaebea229b7b52ad610984a979ea09e565",
            "0x27feb453dd1e91b41d5860c32ac34470d101f6e5da57c57c4e0c074c5d00cd5d",
            "0x069bf514fa826397e81c88d4587530538e10baeb5e0388048030287d85b2b5f9",
            "0x6c89d2775e9919fe8afde564755021b2291a797490e7d64a42231cd0e9ebec85",
            "0x01975a1e08fac4209e625990cd4a0fbf2fa05e3c08d9e98898a5f50207f36c04",
            "0x5eb6d26ad0d67a9af50cccb5e4d2e7c11e8d9e86fe51c61483cb62b84dd8e2bb",
            "0xb600b487433b17d85b33ae7567e4558698afd3f72a8fa968985ac847055e09bc",
            "0x002dd9d9fc69777dfac9ae0cae8d9b47ece05930f3dc971c23a3e7674629ce72",
            "0x384b2c0059e7ecae49b44dfa6f5ed44fd9fac1dc0fab8c01d341cc886bd45789",
            "0x403412968589902149efd2df44385afa00c4299c52aa83d64008bbee0c953d47",
            "0xb6ef0c02e08374d3cea3eda42b8e08ed218033a70406712c9db64620ebe6ff62",
            "0xca031374a4aa643a169e7edbfa8505b310b52f1559c49f7bb1acbcbd9281f8fe",
            "0xeac0cf72d02033c8d24dd22ca23882773402f8791f57d9e3f161b1086cea39bf",
            "0x7ac526702bccafe985f08a35ab96250066f230bfa4c589696d52f388dc28cd9b",
            "0x7663feb1a75df42652c26c6c114d711956b03de8aada2493e8e858bc19163f18",
            "0x7dd2137fdb2f69d3714bbd8cdc1be5ad0a4503ddfe19ffb8e752ee3537a6baab",
            "0x88608458416217eb145836116357017d8ee7f0bff8f18e2a708b578645b115f7",
            "0x03037c03f30232ed8b486ee3e43212f40d7e48317c733fad92034850420a29c6",
            "0x96c58606a41010569c74160b3ff879948d4e254f305df63491dfb77637bb6fcb",
            "0xc6391d3137b9937cc53e7044c7fde0e9e3d37ff3e2ce3e2c2daa40a1e855e8d6",
            "0x126acf8dea4af4f8477d83fd40096277b8f46be7ce6f48c3f5ce12c73dbea9e2",
            "0x5a3bb37a3859bfc316580c2c3016e0a602cc578e518fff5a1ca560cc3d457ff5",
            "0x30c1bdd22384b8a1187dc5c30fe0aed454e1bbe724fad44e619fcf26287455a5",
            "0xd664ff7bd195031873ab12bfddc3399bcab5a5e5e6b66e0ec9e7aca5eea533b9",
            "0x52353a3786a5bc637d2a767d440a13ac426ae372301882a69cf99be5c08b9b34",
            "0x8640c1cb3208b965e5405b952d4400f76ba5942640b6ff75559411d567c6624b",
            "0xfc401c21638aeb2b853bb0e29bae2468fe6d757e76f455a0e00061301d243692",
            "0xced23b981bc2fd12d5b45b8ae3f5b0effbb21cadc2d6431f677621ec8023ffc2",
            "0x2b63a9e4d7d27a19ad8c84e2035b0bc5e1e2f61ceb53ad9fa7569f639bff78ec",
            "0x9991c76fa2ba076162f0b8d21b9b2a6b2b9fe9dd5403dd6a4a05a72c85569a03",
            "0x9a3a09b54dcae0cfe70d12a5d675f7e400d3f6d5c3b43ec018c7c1f587584ff4",
            "0x848d7a6be7e269ee54437dc0272501e3aba635ad277903abafd75a21652ebde3",
            "0xf4afe5774ac8d7196ad36103769ef606faa8a1c70284b609d5993db3c99773ee",
            "0xdb2cc3a2dd936e22f3cccdacd3a95d6541070e2a0a9440b68d5b17036c791e25",
            "0xdfc82c9edf56322fc2b2b42c49b4053fada87559d4269dc7f62df2043dff0391",
            "0x6d4131a2c049efb6cbe31fcdc03aba6952875efbc8df336b915aea67a6d17cfa",
            "0xc469810e7856cf8d1f748f2e5f8f80084253272019056b69474d0f10ff181ece",
            "0x313e76bb4c1d58dd51df593e00369185d3612a660f67d5a3751bc341585b1eb4",
            "0x6baf070c42ec0033ff0b0dec233c4ce7ab4f8b94369f67d02a6eb1a48ca6dff9",
            "0x7544a200cb8855073410e2ef14666a2846f9e3c962fd68ab060bc63b2bf376f8",
            "0xb6ca49f11c2be3541178e6896b98bf47b7c392e20c8c4c9e8dfc439ba7d34d37",
            "0x5252bea73f0cb25d0096362e39faf73dd86eb1d1de8449bacf4aa7da96eaec4e",
            "0x666875fa51d4cabf200b63db9b7c3110c593c60658f9ee174181ed7790a6f6de",
            "0x68dd0295bf7d2f0d636ebc5d551db39132b3c8dc2374c1382a3a91d753cc93f7",
            "0x4dbf6d86b0c8f87589b44fa8b8986684febb58815be0fb51bb5ab4904c3dd816",
            "0xf5dac89d6f756e8e0728993f91420f883658306974b85df38d86dab3b1b66522",
            "0x1929a2dd505f80e1d883eeaaccd09c3392e5d9ff0d42ebdf869bb413e72ae406",
            "0x43c076bffb1b83e9208776bdc63b8e52ca2957c0f53966f0d388d97fe90ab84f",
            "0x67abe41b249287654a1e34d15f386a11fb384dcb406ad179b7b6b6e2c66fbc58",
            "0x8a8a45cea8595016bcad108c281ee8612cb0f6d4397d368315488feaa5f798d3",
            "0x11592924727a9175d05e57635dc4b7eef9bebf67da90d590adeb3f2f27d3f4f4",
            "0x8d816313b6dd7524ec3a22f82edee1aeb147a8468824c29bf48b53d2dc78a160",
            "0x180de77173fd1e0a108a191f79edd955e35728d4dc17f00f3eb4f2a5aeb40d53",
            "0x118f5228f1faf3c2301201d0451e578bae7bd7fae9c2aa860a85877fc94065d6",
            "0xd23194a13c3302913bc044b8912f6361dfa997e667a8e00913e1349df04586a4",
            "0x16395ca6eb8963ee04e3181c7233fa417678bc9446bd2602bf5f9b8eeb5b17c4",
            "0x9d50f7dd271dff2451b4021ff75d0e581eae95d67260bc2ddf0c3e06d08b58f6",
            "0xe342270887c85b5a5be6068ca116ebdf4a53ee29f5cbd0b1b6dd9b66f99699ec",
            "0x74960a4a67cbf20e4e660747e16d9c82eff0b614baf34fc98dd125323555e319",
            "0x0ba0a9eb5c3ba2700d70d1cb00dd1ba892205f47883690f5343f0d6e8a012110",
            "0xbdc97aa06937fbb6227deaaf4242c4c136b03f7bf1c466b672c96b1e1994203b",
            "0xccef5dd7738d65689ccfab4ce87431132dcff26c30f1337017c6f2cd2573f121",
            "0xd4b7fa9c33c877ad0e0ca65caf27998e7d32bc3ef9cd351c2c318b294468c8ab",
            "0x676858b075e31a88caf5d84bfb5e8bc8f1fda60c8b47ad6d1510e16025dab1b5",
            "0x467afd1e746c073475d396198420fb504c330bc9759a9d49fb375c3831ccd863",
            "0xc41560172f2c1e5880de04c06bc28872cf1aaf2bf5e86a42979b4ecfcd44d311",
            "0xfc505c0a8009f008433aaf366e7a8a585f66336e77ab3066630552bb8c67a800",
            "0x7454273c2845eea8611fecce8016bcbf7571959a1600c7ac97387ed3510e3582",
            "0xdc856c8d91705f4b3d03964c8ad4befc3799a8849f2d527709432db45d3a388c",
            "0x17d71b1691589e9597fc6d29d571be8d674f86538355806e697af188cb18eea9",
            "0x5f0faee4777596897c3f8b7206ae31fe7ed5d3eb4718cdba07e1e743cda7cc1a",
            "0x7c68af4b9e5c22ce5bcf74929a19180ad06125a80e9118128b653d0056260c58",
            "0xe222040952e6f7fd617290b7b8904b00f81ef49e4fb37be040db1f66f1f4ddc8",
            "0x1ad0b706c9a1d376cde377fb73395ecd5e0e55f428ad3299317806daef8de882",
            "0x4f24aff0b5d7269902fef75cb69ba67aefd39f114f91b0d7a519e86e10d9c8b7",
            "0x32e23029b54b3ffbc78c4e9f115a4cbefe65faf67ec295e2ad9a0603ed44d4de",
            "0xfc424bbd777126fb913242238dafbacdd75344b6fd0f6d524d64f85b7420627d",
            "0x2742143d7f34fa33714619ccf9c1f01f4f32a47ccbf69b6ecff00d398c483cf7",
            "0x81d16e35c2f2372d18b2898778cd9f81eaa0a553b06bcc2620d69d2df39431ac",
            "0x5ff48d7e61c45a9be174bf915f864318123dd16458550322b2fca85490a4c0f6",
            "0xdfedd288385085f2f33a4235d9e65dffca463c555f3ef351f7ac6992360e6980",
            "0xf8e19739eb8068854f9e6a2274a826228896d0e8c56b33ace69199a92385c6e4",
            "0x72c03ec1db7496a464214c3c17c2303d55882ff873ddd42cd9aadd11d6cd4674",
            "0xcd66de6e1ba35f34e0c1ae90d470abba0b39cb798909db5350aaa0414121cfa6",
            "0x647544c734fff0189ab55e86e2a38c78d4764aea12ed0cd16c3dbee9aca5a4c9",
            "0x2fd9010ba8d614a8492c02914bc5aa9504e588ce2b98b7c097eb78c02318f734",
            "0xf9e4ae3673db5a8961fdbd3253643b2f09a475b76a2d3639671bb5b8d8df8599",
            "0x269240fcb4257e6e0b2d970d8a08b06fd56226b0afbc3c41ae952cebd1d1e84d",
            "0x2f9db6986f9d46736e6532030627e0be514e6e7c8d844e316ec589d3e0dbb573",
            "0xeb32497fce6f101f55959ea2ac0b090a0b26032865c74e279754ba13384f2245",
            "0x4257448420523d4320b38aee51ef17e72ad59b316c390267f524dcb51fa1f3e2",
            "0x511ba0618f654bce433edc15ead66c282b9628049398b117c8dea68b5956484c",
            "0xa5ab42e4353a63a1dbbb5fcd9827b0b5784468b4c71074ad5124eb84ea87b687",
            "0x018b3ecb07b3487253f4c6f26c4a66518e5b4127433da45e10f88a458da19932",
            "0x8d9c8a91a8ffb007f20622068d27b3d21e641cf4495bd7791f76eff22bbe3b5a",
            "0xc65564c139b75062f4989cb2eed6c436e6036f281c8c5dfd811911b7575b03bb",
            "0x1fa029e5ff784a280d1d3aa8a0738942ecea6f271d0b3cb852edd2233fbf807b",
            "0x893eb054cc26a7f84904a4c038f8b5ab62b6fd97201526308699c6f750879cb8",
            "0x52150a57b9f7e1b4cd27294a81a27966421a791b11238075818d70683fd716d1",
            "0xb56f65e5aa53351984d177cb0e9099f386c10ad0989255b0dc2818982c08794e",
            "0x2a2b18674d4e5955ead4f4c3ee115e26ccd4f5d16112fc8438ab4424f18ec9bc",
            "0xb30bd6264b27feec0fb74dbf5c0dfbf0c2f6c4e7a69c0c265f3fad84f94f622d",
            "0x30f32b6cefaba17d25b5a8c58cd42c60e19a7f0dd1f16251bfcede5bda55b7bc",
            "0x48c3c9f6a2344284079d4ee6ffc186c5eb36a5a5a88c3c2e256690d6e5a9dc15",
            "0x6a29c02a54d80de73c015bb4f769ec74fdb61e784b0ca07ecb5c88adc0554e4b",
          ],
          "transactionsRoot": "0x5c41008fd93b95aff0a1a453b657539b7e43d67d20c196c87fe59f5f2f1dd214",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x12380f1",
              "index": "0x4fc875b",
              "validatorIndex": "0xbee4f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3f62a7a",
              "index": "0x4fc875c",
              "validatorIndex": "0xbee50",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1256773",
              "index": "0x4fc875d",
              "validatorIndex": "0xbee56",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x125b69c",
              "index": "0x4fc875e",
              "validatorIndex": "0xbee57",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3e33e35",
              "index": "0x4fc875f",
              "validatorIndex": "0xbee58",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1266095",
              "index": "0x4fc8760",
              "validatorIndex": "0xbee59",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1278100",
              "index": "0x4fc8761",
              "validatorIndex": "0xbee5a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127ad22",
              "index": "0x4fc8762",
              "validatorIndex": "0xbee5b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127d890",
              "index": "0x4fc8763",
              "validatorIndex": "0xbee5c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x12612df",
              "index": "0x4fc8764",
              "validatorIndex": "0xbee5d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3e39635",
              "index": "0x4fc8765",
              "validatorIndex": "0xbee5e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x126c872",
              "index": "0x4fc8766",
              "validatorIndex": "0xbee5f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1268edf",
              "index": "0x4fc8767",
              "validatorIndex": "0xbee60",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1267257",
              "index": "0x4fc8768",
              "validatorIndex": "0xbee61",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1269208",
              "index": "0x4fc8769",
              "validatorIndex": "0xbee62",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x127534c",
              "index": "0x4fc876a",
              "validatorIndex": "0xbee63",
            },
          ],
          "withdrawalsRoot": "0x96c5c22e9b58cb7141b2aecf4250fc84b0486a00a78353cdcfc9d42c214b2127",
        },
      }
    `)
      expect(client.requests.size).toBe(0)
    })

    test('serial requests', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
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

      const client_2 = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
      const response = await Promise.all(
        Array.from({ length: 100 }).map(async (_, i) => {
          return await client_2.requestAsync({
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
      expect(client_2.requests.size).toBe(0)
      await wait(500)
    }, 30_000)

    test('invalid request', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
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
        "id": 1,
        "jsonrpc": "2.0",
      }
    `,
      )
    })

    test.skip('timeout', async () => {
      const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)

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
  },
)
