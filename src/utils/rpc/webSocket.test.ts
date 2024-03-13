import { WebSocket } from 'isows'
import { describe, expect, test } from 'vitest'

import { forkBlockNumber, localWsUrl } from '~test/src/constants.js'
import { publicClient, testClient } from '~test/src/utils.js'

import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { mine } from '../../actions/test/mine.js'
import type { RpcResponse } from '../../types/rpc.js'
import { numberToHex } from '../encoding/toHex.js'
import { wait } from '../wait.js'
import { getWebSocketRpcClient } from './webSocket.js'

describe('getWebSocketRpcClient', () => {
  test('creates WebSocket instance', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
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
})

describe('request', () => {
  test('valid request', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
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
        "result": "anvil/v0.2.0",
      }
    `)
    expect(socketClient.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
    const { id, ...block } = await new Promise<any>((resolve) =>
      socketClient.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(forkBlockNumber), false],
        },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
        {
          "jsonrpc": "2.0",
          "result": {
            "baseFeePerGas": "0x2f9b711b9",
            "difficulty": "0x0",
            "extraData": "0x6265617665726275696c642e6f7267",
            "gasLimit": "0x1c9c380",
            "gasUsed": "0x120bbd0",
            "hash": "0x3f900200152e9e7731b6adfb4a9a5cf43c71f3ff600962efe544f3b1d9466fac",
            "logsBloom": "0xeeec4ae861e4d9e400eb97e3c26253a37852273ababa634d97d300674e269f1a567884ba980b255ac72c1d787a129b8786e9b4201f21316cb6e8274545adbe4fb9264bf2f936df28efcdf72ff393486d4adae488455c34ed5c7d3e158d070938db650d71021a42da46105b004f05ad1fd614768209bc8ef44e0ada968a384a791639509379623bcbc1fc8cb876e3282969c5b9abc354b159678dd87153b6aecbbec06d7f3eb37a9a98596ce72c638ac7c2788ea00a36f0cfb96f0ec314bc8b4a473b955fc5c4dbdba1aaddb5a9c412165169cae009ae09561a79ab8f822cfd533d73bd988dd42dc4185618f62b310b40173f62b628fe2fe5958e3b14acc60860",
            "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
            "mixHash": "0xd7de5432d0e9545465317f2f0f82f6f60dfc35055103378c2b4c19a9218e7c75",
            "nonce": "0x0000000000000000",
            "number": "0xf86cc2",
            "parentHash": "0xb932f77cf770d1d1c8f861153eec1e990f5d56b6ffdb4ac06aef3cca51ef37d4",
            "receiptsRoot": "0x7c577c7a2c1649735565691411b9236e1946dc74f3f474d15c014bece0104de8",
            "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
            "size": "0x18011",
            "stateRoot": "0x651162a87a2905c6f37ab5f0a2676f9cd8fc5ff618cb5c1a89bf25ddea7f391c",
            "timestamp": "0x63abc18b",
            "totalDifficulty": "0xc70d815d562d3cfa955",
            "transactions": [
              "0x1351de11f81a077cd300914e278c870c3df5b26d3f3b2a4a3f8db76bc138e7d3",
              "0x7d5c80f38b2e706aa3bd19b234e6026c8a4c0543bf299dfe609193693ac27dfb",
              "0xc986d00394b3aea84f19906037be219456f13894c0fcfecbd242b36d52a0fa01",
              "0x73271cf06de97fdbbf0be2bb13b9376a98b1715b6d463c81f5ce73a9988b6f5c",
              "0x48c27153e0fd95de6bb7858dc42ff2d16aa0123ff6f4839dda23da82c170df13",
              "0xb901cc43954131517926708106398c5c0c3c77c2550b18fb7bd6eb45a6b39284",
              "0xc6d0d2bf4e46725ed595acdc8bc841994d1e63500c0c06671bc19379c5f111dd",
              "0xb05036fbb0125a493090289331e0b9d44c8ebb3f7852c0a1657ff9e0fce0f51f",
              "0x14bbc701396fffe3b212eb96af063cb97e05ee36c98b133da22a5968a4b38707",
              "0x6b96c5431807ef6792333f1e448dc52d72d24b1460879da6b88a94858bc27a12",
              "0xda1f70f856e3ffc9ed5d5c3c91d8e13b0256931ca759be650407de7053842f4c",
              "0xe52666b85980c7f2cdf1c36ef32a69164c65250109bc9f639ebbc990390c8176",
              "0x5010f98f3ed2110fd40c8b463ad9fa56fe9f026d3bbbfa27a86238ea69084056",
              "0xa554462712447f7edee4cef01317d1d2438200c70f0eafd696d21ae6483472ae",
              "0x4d85ba6c319c5f05768bd42bc3a8509ffb20873c763bacf72b13d6febde479a7",
              "0xaf32af489ae7d94b22cd47c6b1ad44872a5b5781ed329e2e5dc622c1ad9b0be2",
              "0x5be511e63eabbaaeb0436e972e34747edd255e30155d6e943e0c4cc81980efea",
              "0xdad9805520d2eb35019f9f7692750959943a9c1dc9ecf31d234273eb0af93be5",
              "0x33e0a938bdb373ab8a57a03d20faa1fad0b793c86b61cc8cfbd9187f7a7a8f6c",
              "0x552e8b37157fa2fc8576b56e73b314d6001531e00c8c406c25b46c2275d99cb4",
              "0x8a47abc6188d6500b71744d03c68e20b017a33c4291b30eb6c8a1d332b03a654",
              "0xf6a51940f09b38b619958b2955841d6a5c80230a4bfda8266a2c59ebb2722528",
              "0x6d0adc2c20661faa7fab9ab72d09c7688fc61ab1d5d6d2f453b969c820377a2b",
              "0x91963d8420403980eeee8434d1d158dc0e7fb035d0b6bbc0cfa795965a9189c6",
              "0x4bb35a76df1f1b12cdb722f86548061bdcad763a96a0ee1a0bf8f8a3acc4894b",
              "0xbb1be5996b36846b4455ee515e701a8619741e035b89e7abf0b8dccba3d882fc",
              "0x995df00e7dd97dd7d591ebab4a8af2a5689ce67d98378857311715fc0c04e3c4",
              "0x6d0ef7c18c8a79e8c5357ede322c0f3c9bb79b423dcd38d68ece250d6dd90e82",
              "0x5e23f022fe06150e4269e76a0607732d960cec687398d7bb9551e2f396629a54",
              "0xc284f18afa7be933a7c2dd81666553ecb454280d68c5ab368e980e75d18cf341",
              "0x89710dd344aee964826271ee471c290cc07c75f5fa1567d3fb7a5bd7d9c98fd1",
              "0x0c98cd5eeeb28e14eeef72fc71432467b87f5b726adc97372d8a0533023d306b",
              "0xf9a3c04b2f40ca3b42a61988ada325db3ab11bda42ab9cb9c01c685e4d66bc04",
              "0x55531cea77c328a669b76543c20352346172f40d206afe38f25a8e79b1cd89eb",
              "0xb7d3f39769d5e1da93f979809d59fc0950136cfe4e58a59ae322993ad444d787",
              "0x4b3cb165f91b96ba7a90fe7cc1cb5dcf0d8ea379446970c650273f8e11cb5957",
              "0x4778b34dae4eb5de168b9c8aadec570cd8e73ff31f8633d84ebad667b736c5ef",
              "0xa298bfbb6cfd9f9663205aa81032df3f09c4ebdf5ff3411cd4db787429b6d014",
              "0x2b76948313eb52ab9e06b171d9ab6e746d19ef031e5d94bbb7f9d8ec532a9fe8",
              "0xa5835cf94ea79ec5518e4d0400f206e57bcab07696fcea7cf6308cd4c3647cfb",
              "0xfb00b96840d28381ea9d09d185d6bc0882acfba09a5b64997dab030178fee0a1",
              "0x30b4a72ee9e077c57c78cf86d8d2d6efef9f28f84f85eddeca5e35476fe011f8",
              "0x48d8e59134e8e89987b6059bda69d988b19a78e072c6c40dcf25b748d7916aac",
              "0x35af74b2deb8ea65742be1e8b75ad1c49bbbf01d1bfd26037fcaf3cd89926e39",
              "0x6763cf676ad90dfb40a6bd22d54d36a65571874c66b6e1bea3690cad8d051321",
              "0x760054fc96b0f8612dad81cea54de6d55622259a4a022398537d2814ed8ccb17",
              "0x2d58f61719af0756262b390ab0587babadb77da1403695dbb9b58dd5f4148d30",
              "0x6d1277534c5314ac1a7b9c05f92040c53144c45b55676c604304a4e3c4e9e0ac",
              "0xfa5bfaaed054884e849ce6988ab948ad7e98158741013c8da40f280879103125",
              "0xec2c8a649815c8a76a1c9d5ae0a4d2ca5530207dd59c84beb79e643c2b4699de",
              "0x5fc207821af511e130bac12d541562db4f9f956e2d2150cbdcce2ff2b2271dfe",
              "0xb3ca73f157d9837633dd44b86bb7b91fcdfabfeba6339f3cd5e5d2ca0a99054c",
              "0xdcb443a670462f3dc014e721b9b57a68d9288bebc74a29172192099746392cdb",
              "0x815de12d2b3d66a7cb0a29f0a21a597d1d6c5eadd077a2e42543c8266c1c552f",
              "0x5b8ed4cb34ed17d8e82f9037d828b73f3ec09caec6691a4919df7759d02cb989",
              "0xa4d7bcba3b2a421fe3af2ba43f8a30ea662015d8292916dd231bc6b125be8378",
              "0x69def64bae7292bc0a5c72d4b9f14426cc8d7aa12f89ba2fa685f63c466e398e",
              "0xad6f4e025468372f4b6e925584beb95675da74217d6344637443b0f1267af09b",
              "0x7c207ef61607ba16622cf9796156a22a29dab59ed77666ef5b81808fb8feca81",
              "0xc5ac8b92f5216cdd316cc4c28f3cdd6ee6978cb848379c51b8ce6ea5a8c0a231",
              "0x856d42db3f08e9c493d4e0239a5e6e610c58951a87d55eb4c6c7103d1e9818af",
              "0x557775076b85cead00fc6c33417b56743baf7cb301f965dd8e35263d18b860c2",
              "0x930031f6567e75ddbc7061ef851b0c1cb95eecf57c4db559b63e9f78b132011b",
              "0x3d016940fac9cbcb035310141727206a5a7cd936b8ac7ef8ad492f2c35f10b06",
              "0x5cc81c393a2c1523b9a8342eb2a291321ee8c5cd99a0f647570e3cc4fade8a7f",
              "0x75b03ab8d646c483878914bd0c91c1d1a2018f0fa039e72ad35cc9fb657f324e",
              "0xfd38eecb7f9689315484627791d3393d2f7286b40be85c0f44b879cb46710645",
              "0xf2f08c1b2723ac801ec471099071a6d8d60ab0b3847dd14400a88ca6fe2b0804",
              "0xafc9d2533c985139de1e3cda1c3ebdb022456d644dc0b32e05c8ce602cb0308f",
              "0x0f06d0716036c226992ae14def944de3bf651459f7d1a631b88d63bb35db2287",
              "0xc332aa7d2c9459a8149bdd04a0da2552f7fd3871d6dc00c932bb8ca115e3b124",
              "0xcdac2adc326d645b9ecdaf1954da28026957c87873f7e97d6236756395385901",
              "0x890e71419171b6c94acfa3859d9cad0acfae4095a4d4989b2f613e429e4e8f60",
              "0x681ede0467b184ae2fbc17b4d3a78d1eaa4674555494aaf872abe72c1ac10c57",
              "0xdcc80cfc23ad4582fca9b31590dc7badd5104b90e564e6e73718f437118c7f73",
              "0x53421fb3b6ce41428288863ab2983601400662ecee01f25f8005e13edae57be9",
              "0xabc0c5603cce5690d0c66a50e938a13e3ec5a5252345e70348b11276f2d3f3dd",
              "0x9b3f6a66edaf57e527d167569bc28ed14fd74a3b57dda552a98249372c559693",
              "0x1944f7eef251c45eb7a41c3dcbb2e38d05a68c935678d9de83352b2c553583c6",
              "0x37bc6090d2417fba1b1b06c5d1416be4012ca79df2e88d65c0b70fdbea28e85f",
              "0x9e35edc9fd33b00138cb4740aa9fcc67fb4a55639e30e3f55100f6fde63219fa",
              "0x93f72376c013a41bbac041280e426808162ae3c7fff4c86336283a338f98c629",
              "0x74277cfdf9d119e4acc2ac5b91883ade1888dce2d6f27a854ee12301379f7b72",
              "0x98889715672a70ca2e2d7b5c30269523a11ec510cf906d26f842692644265983",
              "0x11265cfc4888c5c00ec3848cbbf6b97c923127a8d71a576d9f40f29aaac3fab1",
              "0x227eafafdbbf1b38cb9b44720780c8730f5fcc963417d214c1b5b3ae15aea8ac",
              "0x789a22790ccc6db1aad0d4fdacef1e99f985083dac5c71684a05984173eb722e",
              "0x7ed24aed7c45de70482f19ce398574cd753d47fa26a5a72f7a85fbaebe1f3247",
              "0x95880d0c34bb3ed909f73dde91f24262724d231256739c79cfb76e5456d2da5e",
              "0x31299e470fc68ea56bd9f04b0cf1a63f56b48ff8475474e784f783db1fecad0c",
              "0x846a23db36d000b6c3dc4c4404daab5e749488273b022819f97250224ce86602",
              "0x011a92b6ae845fca18c3877e71602755983960c424233e3995868afadbb08915",
              "0xba48629772708a411d27be75f1f1b4ce94b5c61f1d5c3f742bf46dd911169ab4",
              "0xfca880cf632eb59cf79326690962288aa469a3f8ea5ed5431a6b3da2bd9524ea",
              "0xb82ecba811355e826346a633ba3f7a924f84ca0f7bab43b39423280539ac3e2e",
              "0x0f05979f9d7725b0dcc01c928d16e83842cc7fb7471827482ea7a912c0d49d13",
              "0x421cfd9ee8c958c87a24dbe2b315d101ed04579287199ca49fec93af3f5c6b44",
              "0x009797083528b2b097b5ed4e86b7a8ce09d4d230bc47ad5fc55056eba992af9c",
              "0xda306790bea2079c8332d113b9c0b2b94d947c11534a8d43844e1742ef3f0b87",
              "0xa7ca2796de5c4cd6ddc53debcde5ce1f97ff04a42679a7dc69cdd3ccef801818",
              "0xf930a383591fb426df5dc75d394368c5708d3fc45f280ed4d4f9893d1b5e0f64",
              "0xb3acc2d780a5fcd79afc84974fb0051ebba73b454053e9a0c3844625aebb7438",
              "0x50b247b9da00fa48d62b10e78e5f139da0169313b7051f328f56d987b7f72635",
              "0xac5c12ce32adffa8c6a39adaa54e4f9921086b1549858ddb8352611a9bc6dfaf",
              "0x211cc2097a9503e2d20a83d2e04bf04e2eae54fcf212de1d7c5c44f1dc2d4f26",
              "0xe81b13eaf7b676a84b028f0d9b015c517ca2d5c1040889fbf76e9213c81f5a13",
              "0x759fdf6ed79a4880c19dc2aeae6f402d3c2548c69a4ff2c414185d50d681a9b3",
              "0x4228cbaa3829b28afc56074a75761bc700547bce00bf62624e33d2561c0b55db",
              "0xcb0f89c3dc21d62b81ff4d1954b7b746d5667c6eb05182c08b9538a1d9e315c8",
              "0x5d0d1c7f0fb49a562150cd818dc7407d944f9d7724c688815dbb745cbd413f0e",
              "0x315b36e3411c3bb8a1c092c80eab9c19fd37db319dfc41befbbce9e78704988f",
              "0x8359dfc29f6fa9e06ba34cfa07b799a9203f17e42d3b5b3d7c48616ae1bd9aeb",
              "0xdc28479bc50ff36814c3272723405be178a67d0ec380719bc5d791031ec0e565",
              "0x3439e8ceba82c5b4a07f7c22be78c9650c88c384fdfb78572a5baa0289f723c7",
              "0xce6487ec2ea20a752cb27b5252faf15c7e75c07c95164a6be6a680e5411417bd",
              "0xda73b97749449576b0b3b406be397babab8ac683d2c63efaadfab98c0b01f6df",
              "0x8335757eabcb45e9de63bd17466223e59885ac9455331acff3035ee841545ffc",
              "0x1d19308d55db9fefe56833ddaa46ebdaefc8374acb944a0cdf0e54612ee823c6",
              "0xbf39356cc9332569595ba559e7a93455d6821f06607b5f81fa9ef497cef8ded4",
              "0x21c53c6633f95c9d09873f882357b9d3c9d578e36ac9ff4522c4f162d8f063c6",
              "0x080e51f918966a1a991fb35bf43f03f3d4b1d059b930f9425d03243909e6627e",
              "0x850bbd853553d4e63e7deae2b46c717f4898eb4cd2ab70b92074ba75e0669b28",
              "0x560bd9e5208ffab137318cb78dd22d022418ef05851559df6373184b6008d921",
              "0x68b994d4812451cd5dd0a6f79ec4af6c55bd81af96e80f398378827bfd2bfc79",
              "0xc8d2c46cfc54c6ee29c4ca9f11ff6775051d59b1c774fd2fa732f92236f535ba",
              "0xb706132112362fe076cca1c33cf4fef2e910f70fe2a453e45b710034059f1757",
              "0xb19912b950a53e2a6b16bfe2e8847f43ba7a3d15993701ebebe0e9c0971ca3dc",
              "0xcc8c01edc1360397cca04b87c4d94819da70fab718dc1c75cad7c43f82502d9e",
              "0x1a10b69ecdfb19ec88477595d14627de4335de63ee04d3273822cb571327f8a8",
              "0xcfab191eed98547c47065c6d3e5759306423f9c2610629adb5df336c7224bddb",
              "0xcf8fdcb00038d10d5fa3c847e4611ffee02ac20ee75ad45841451c9f1410e045",
              "0xe6d72fe86fbfa94a7e03e72d292f8d4bab188b18a4d732b500fc867d84bd86d6",
            ],
            "transactionsRoot": "0xe1aed9562570b4a0f31aebcc7558960f7aeafa3bd2a062977e2c927ff795af27",
            "uncles": [],
          },
        }
      `)
    expect(socketClient.requests.size).toBe(0)
  })

  test('invalid request', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
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
        "id": 2,
        "jsonrpc": "2.0",
      }
    `,
    )
    expect(socketClient.requests.size).toBe(0)
  })

  test('invalid request (closing socket)', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
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
      Request body: {"jsonrpc":"2.0","id":3,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@1.0.2]
    `,
    )
    await wait(100)
  })

  test('invalid request (closed socket)', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
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
      Request body: {"jsonrpc":"2.0","id":4,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@1.0.2]
    `,
    )
  })
})

describe('request (subscription)', () => {
  test('basic', async () => {
    const socketClient = await getWebSocketRpcClient(localWsUrl)
    const data_: RpcResponse[] = []
    socketClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => data_.push(data),
    })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    await mine(testClient, { blocks: 1 })
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
    await mine(testClient, { blocks: 1 })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    expect(socketClient.subscriptions.size).toBe(0)
    expect(data_.length).toBe(3)
  })

  test('multiple', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
    const s1: RpcResponse[] = []
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s1.push(data),
    })
    const s2: RpcResponse[] = []
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s2.push(data),
    })
    const s3: RpcResponse[] = []
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
      },
      onResponse: (data) => s3.push(data),
    })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(3)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(3)
    expect(s3.length).toBe(1)
    await client.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s1[0] as any).result],
      },
    })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    await mine(testClient, { blocks: 1 })
    await wait(100)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(2)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    await client.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s2[0] as any).result],
      },
    })
    await client.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s3[0] as any).result],
      },
    })
    await wait(2000)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(0)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
  })

  test('invalid subscription', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
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
        "id": 13,
        "jsonrpc": "2.0",
      }
    `)
  })
})

describe('requestAsync', () => {
  test('valid request', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
    const { id, ...version } = await client.requestAsync({
      body: { method: 'web3_clientVersion' },
    })
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v0.2.0",
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
    const { id, ...block } = await client.requestAsync({
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(forkBlockNumber), false],
      },
    })
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
        {
          "jsonrpc": "2.0",
          "result": {
            "baseFeePerGas": "0x2f9b711b9",
            "difficulty": "0x0",
            "extraData": "0x6265617665726275696c642e6f7267",
            "gasLimit": "0x1c9c380",
            "gasUsed": "0x120bbd0",
            "hash": "0x3f900200152e9e7731b6adfb4a9a5cf43c71f3ff600962efe544f3b1d9466fac",
            "logsBloom": "0xeeec4ae861e4d9e400eb97e3c26253a37852273ababa634d97d300674e269f1a567884ba980b255ac72c1d787a129b8786e9b4201f21316cb6e8274545adbe4fb9264bf2f936df28efcdf72ff393486d4adae488455c34ed5c7d3e158d070938db650d71021a42da46105b004f05ad1fd614768209bc8ef44e0ada968a384a791639509379623bcbc1fc8cb876e3282969c5b9abc354b159678dd87153b6aecbbec06d7f3eb37a9a98596ce72c638ac7c2788ea00a36f0cfb96f0ec314bc8b4a473b955fc5c4dbdba1aaddb5a9c412165169cae009ae09561a79ab8f822cfd533d73bd988dd42dc4185618f62b310b40173f62b628fe2fe5958e3b14acc60860",
            "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
            "mixHash": "0xd7de5432d0e9545465317f2f0f82f6f60dfc35055103378c2b4c19a9218e7c75",
            "nonce": "0x0000000000000000",
            "number": "0xf86cc2",
            "parentHash": "0xb932f77cf770d1d1c8f861153eec1e990f5d56b6ffdb4ac06aef3cca51ef37d4",
            "receiptsRoot": "0x7c577c7a2c1649735565691411b9236e1946dc74f3f474d15c014bece0104de8",
            "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
            "size": "0x18011",
            "stateRoot": "0x651162a87a2905c6f37ab5f0a2676f9cd8fc5ff618cb5c1a89bf25ddea7f391c",
            "timestamp": "0x63abc18b",
            "totalDifficulty": "0xc70d815d562d3cfa955",
            "transactions": [
              "0x1351de11f81a077cd300914e278c870c3df5b26d3f3b2a4a3f8db76bc138e7d3",
              "0x7d5c80f38b2e706aa3bd19b234e6026c8a4c0543bf299dfe609193693ac27dfb",
              "0xc986d00394b3aea84f19906037be219456f13894c0fcfecbd242b36d52a0fa01",
              "0x73271cf06de97fdbbf0be2bb13b9376a98b1715b6d463c81f5ce73a9988b6f5c",
              "0x48c27153e0fd95de6bb7858dc42ff2d16aa0123ff6f4839dda23da82c170df13",
              "0xb901cc43954131517926708106398c5c0c3c77c2550b18fb7bd6eb45a6b39284",
              "0xc6d0d2bf4e46725ed595acdc8bc841994d1e63500c0c06671bc19379c5f111dd",
              "0xb05036fbb0125a493090289331e0b9d44c8ebb3f7852c0a1657ff9e0fce0f51f",
              "0x14bbc701396fffe3b212eb96af063cb97e05ee36c98b133da22a5968a4b38707",
              "0x6b96c5431807ef6792333f1e448dc52d72d24b1460879da6b88a94858bc27a12",
              "0xda1f70f856e3ffc9ed5d5c3c91d8e13b0256931ca759be650407de7053842f4c",
              "0xe52666b85980c7f2cdf1c36ef32a69164c65250109bc9f639ebbc990390c8176",
              "0x5010f98f3ed2110fd40c8b463ad9fa56fe9f026d3bbbfa27a86238ea69084056",
              "0xa554462712447f7edee4cef01317d1d2438200c70f0eafd696d21ae6483472ae",
              "0x4d85ba6c319c5f05768bd42bc3a8509ffb20873c763bacf72b13d6febde479a7",
              "0xaf32af489ae7d94b22cd47c6b1ad44872a5b5781ed329e2e5dc622c1ad9b0be2",
              "0x5be511e63eabbaaeb0436e972e34747edd255e30155d6e943e0c4cc81980efea",
              "0xdad9805520d2eb35019f9f7692750959943a9c1dc9ecf31d234273eb0af93be5",
              "0x33e0a938bdb373ab8a57a03d20faa1fad0b793c86b61cc8cfbd9187f7a7a8f6c",
              "0x552e8b37157fa2fc8576b56e73b314d6001531e00c8c406c25b46c2275d99cb4",
              "0x8a47abc6188d6500b71744d03c68e20b017a33c4291b30eb6c8a1d332b03a654",
              "0xf6a51940f09b38b619958b2955841d6a5c80230a4bfda8266a2c59ebb2722528",
              "0x6d0adc2c20661faa7fab9ab72d09c7688fc61ab1d5d6d2f453b969c820377a2b",
              "0x91963d8420403980eeee8434d1d158dc0e7fb035d0b6bbc0cfa795965a9189c6",
              "0x4bb35a76df1f1b12cdb722f86548061bdcad763a96a0ee1a0bf8f8a3acc4894b",
              "0xbb1be5996b36846b4455ee515e701a8619741e035b89e7abf0b8dccba3d882fc",
              "0x995df00e7dd97dd7d591ebab4a8af2a5689ce67d98378857311715fc0c04e3c4",
              "0x6d0ef7c18c8a79e8c5357ede322c0f3c9bb79b423dcd38d68ece250d6dd90e82",
              "0x5e23f022fe06150e4269e76a0607732d960cec687398d7bb9551e2f396629a54",
              "0xc284f18afa7be933a7c2dd81666553ecb454280d68c5ab368e980e75d18cf341",
              "0x89710dd344aee964826271ee471c290cc07c75f5fa1567d3fb7a5bd7d9c98fd1",
              "0x0c98cd5eeeb28e14eeef72fc71432467b87f5b726adc97372d8a0533023d306b",
              "0xf9a3c04b2f40ca3b42a61988ada325db3ab11bda42ab9cb9c01c685e4d66bc04",
              "0x55531cea77c328a669b76543c20352346172f40d206afe38f25a8e79b1cd89eb",
              "0xb7d3f39769d5e1da93f979809d59fc0950136cfe4e58a59ae322993ad444d787",
              "0x4b3cb165f91b96ba7a90fe7cc1cb5dcf0d8ea379446970c650273f8e11cb5957",
              "0x4778b34dae4eb5de168b9c8aadec570cd8e73ff31f8633d84ebad667b736c5ef",
              "0xa298bfbb6cfd9f9663205aa81032df3f09c4ebdf5ff3411cd4db787429b6d014",
              "0x2b76948313eb52ab9e06b171d9ab6e746d19ef031e5d94bbb7f9d8ec532a9fe8",
              "0xa5835cf94ea79ec5518e4d0400f206e57bcab07696fcea7cf6308cd4c3647cfb",
              "0xfb00b96840d28381ea9d09d185d6bc0882acfba09a5b64997dab030178fee0a1",
              "0x30b4a72ee9e077c57c78cf86d8d2d6efef9f28f84f85eddeca5e35476fe011f8",
              "0x48d8e59134e8e89987b6059bda69d988b19a78e072c6c40dcf25b748d7916aac",
              "0x35af74b2deb8ea65742be1e8b75ad1c49bbbf01d1bfd26037fcaf3cd89926e39",
              "0x6763cf676ad90dfb40a6bd22d54d36a65571874c66b6e1bea3690cad8d051321",
              "0x760054fc96b0f8612dad81cea54de6d55622259a4a022398537d2814ed8ccb17",
              "0x2d58f61719af0756262b390ab0587babadb77da1403695dbb9b58dd5f4148d30",
              "0x6d1277534c5314ac1a7b9c05f92040c53144c45b55676c604304a4e3c4e9e0ac",
              "0xfa5bfaaed054884e849ce6988ab948ad7e98158741013c8da40f280879103125",
              "0xec2c8a649815c8a76a1c9d5ae0a4d2ca5530207dd59c84beb79e643c2b4699de",
              "0x5fc207821af511e130bac12d541562db4f9f956e2d2150cbdcce2ff2b2271dfe",
              "0xb3ca73f157d9837633dd44b86bb7b91fcdfabfeba6339f3cd5e5d2ca0a99054c",
              "0xdcb443a670462f3dc014e721b9b57a68d9288bebc74a29172192099746392cdb",
              "0x815de12d2b3d66a7cb0a29f0a21a597d1d6c5eadd077a2e42543c8266c1c552f",
              "0x5b8ed4cb34ed17d8e82f9037d828b73f3ec09caec6691a4919df7759d02cb989",
              "0xa4d7bcba3b2a421fe3af2ba43f8a30ea662015d8292916dd231bc6b125be8378",
              "0x69def64bae7292bc0a5c72d4b9f14426cc8d7aa12f89ba2fa685f63c466e398e",
              "0xad6f4e025468372f4b6e925584beb95675da74217d6344637443b0f1267af09b",
              "0x7c207ef61607ba16622cf9796156a22a29dab59ed77666ef5b81808fb8feca81",
              "0xc5ac8b92f5216cdd316cc4c28f3cdd6ee6978cb848379c51b8ce6ea5a8c0a231",
              "0x856d42db3f08e9c493d4e0239a5e6e610c58951a87d55eb4c6c7103d1e9818af",
              "0x557775076b85cead00fc6c33417b56743baf7cb301f965dd8e35263d18b860c2",
              "0x930031f6567e75ddbc7061ef851b0c1cb95eecf57c4db559b63e9f78b132011b",
              "0x3d016940fac9cbcb035310141727206a5a7cd936b8ac7ef8ad492f2c35f10b06",
              "0x5cc81c393a2c1523b9a8342eb2a291321ee8c5cd99a0f647570e3cc4fade8a7f",
              "0x75b03ab8d646c483878914bd0c91c1d1a2018f0fa039e72ad35cc9fb657f324e",
              "0xfd38eecb7f9689315484627791d3393d2f7286b40be85c0f44b879cb46710645",
              "0xf2f08c1b2723ac801ec471099071a6d8d60ab0b3847dd14400a88ca6fe2b0804",
              "0xafc9d2533c985139de1e3cda1c3ebdb022456d644dc0b32e05c8ce602cb0308f",
              "0x0f06d0716036c226992ae14def944de3bf651459f7d1a631b88d63bb35db2287",
              "0xc332aa7d2c9459a8149bdd04a0da2552f7fd3871d6dc00c932bb8ca115e3b124",
              "0xcdac2adc326d645b9ecdaf1954da28026957c87873f7e97d6236756395385901",
              "0x890e71419171b6c94acfa3859d9cad0acfae4095a4d4989b2f613e429e4e8f60",
              "0x681ede0467b184ae2fbc17b4d3a78d1eaa4674555494aaf872abe72c1ac10c57",
              "0xdcc80cfc23ad4582fca9b31590dc7badd5104b90e564e6e73718f437118c7f73",
              "0x53421fb3b6ce41428288863ab2983601400662ecee01f25f8005e13edae57be9",
              "0xabc0c5603cce5690d0c66a50e938a13e3ec5a5252345e70348b11276f2d3f3dd",
              "0x9b3f6a66edaf57e527d167569bc28ed14fd74a3b57dda552a98249372c559693",
              "0x1944f7eef251c45eb7a41c3dcbb2e38d05a68c935678d9de83352b2c553583c6",
              "0x37bc6090d2417fba1b1b06c5d1416be4012ca79df2e88d65c0b70fdbea28e85f",
              "0x9e35edc9fd33b00138cb4740aa9fcc67fb4a55639e30e3f55100f6fde63219fa",
              "0x93f72376c013a41bbac041280e426808162ae3c7fff4c86336283a338f98c629",
              "0x74277cfdf9d119e4acc2ac5b91883ade1888dce2d6f27a854ee12301379f7b72",
              "0x98889715672a70ca2e2d7b5c30269523a11ec510cf906d26f842692644265983",
              "0x11265cfc4888c5c00ec3848cbbf6b97c923127a8d71a576d9f40f29aaac3fab1",
              "0x227eafafdbbf1b38cb9b44720780c8730f5fcc963417d214c1b5b3ae15aea8ac",
              "0x789a22790ccc6db1aad0d4fdacef1e99f985083dac5c71684a05984173eb722e",
              "0x7ed24aed7c45de70482f19ce398574cd753d47fa26a5a72f7a85fbaebe1f3247",
              "0x95880d0c34bb3ed909f73dde91f24262724d231256739c79cfb76e5456d2da5e",
              "0x31299e470fc68ea56bd9f04b0cf1a63f56b48ff8475474e784f783db1fecad0c",
              "0x846a23db36d000b6c3dc4c4404daab5e749488273b022819f97250224ce86602",
              "0x011a92b6ae845fca18c3877e71602755983960c424233e3995868afadbb08915",
              "0xba48629772708a411d27be75f1f1b4ce94b5c61f1d5c3f742bf46dd911169ab4",
              "0xfca880cf632eb59cf79326690962288aa469a3f8ea5ed5431a6b3da2bd9524ea",
              "0xb82ecba811355e826346a633ba3f7a924f84ca0f7bab43b39423280539ac3e2e",
              "0x0f05979f9d7725b0dcc01c928d16e83842cc7fb7471827482ea7a912c0d49d13",
              "0x421cfd9ee8c958c87a24dbe2b315d101ed04579287199ca49fec93af3f5c6b44",
              "0x009797083528b2b097b5ed4e86b7a8ce09d4d230bc47ad5fc55056eba992af9c",
              "0xda306790bea2079c8332d113b9c0b2b94d947c11534a8d43844e1742ef3f0b87",
              "0xa7ca2796de5c4cd6ddc53debcde5ce1f97ff04a42679a7dc69cdd3ccef801818",
              "0xf930a383591fb426df5dc75d394368c5708d3fc45f280ed4d4f9893d1b5e0f64",
              "0xb3acc2d780a5fcd79afc84974fb0051ebba73b454053e9a0c3844625aebb7438",
              "0x50b247b9da00fa48d62b10e78e5f139da0169313b7051f328f56d987b7f72635",
              "0xac5c12ce32adffa8c6a39adaa54e4f9921086b1549858ddb8352611a9bc6dfaf",
              "0x211cc2097a9503e2d20a83d2e04bf04e2eae54fcf212de1d7c5c44f1dc2d4f26",
              "0xe81b13eaf7b676a84b028f0d9b015c517ca2d5c1040889fbf76e9213c81f5a13",
              "0x759fdf6ed79a4880c19dc2aeae6f402d3c2548c69a4ff2c414185d50d681a9b3",
              "0x4228cbaa3829b28afc56074a75761bc700547bce00bf62624e33d2561c0b55db",
              "0xcb0f89c3dc21d62b81ff4d1954b7b746d5667c6eb05182c08b9538a1d9e315c8",
              "0x5d0d1c7f0fb49a562150cd818dc7407d944f9d7724c688815dbb745cbd413f0e",
              "0x315b36e3411c3bb8a1c092c80eab9c19fd37db319dfc41befbbce9e78704988f",
              "0x8359dfc29f6fa9e06ba34cfa07b799a9203f17e42d3b5b3d7c48616ae1bd9aeb",
              "0xdc28479bc50ff36814c3272723405be178a67d0ec380719bc5d791031ec0e565",
              "0x3439e8ceba82c5b4a07f7c22be78c9650c88c384fdfb78572a5baa0289f723c7",
              "0xce6487ec2ea20a752cb27b5252faf15c7e75c07c95164a6be6a680e5411417bd",
              "0xda73b97749449576b0b3b406be397babab8ac683d2c63efaadfab98c0b01f6df",
              "0x8335757eabcb45e9de63bd17466223e59885ac9455331acff3035ee841545ffc",
              "0x1d19308d55db9fefe56833ddaa46ebdaefc8374acb944a0cdf0e54612ee823c6",
              "0xbf39356cc9332569595ba559e7a93455d6821f06607b5f81fa9ef497cef8ded4",
              "0x21c53c6633f95c9d09873f882357b9d3c9d578e36ac9ff4522c4f162d8f063c6",
              "0x080e51f918966a1a991fb35bf43f03f3d4b1d059b930f9425d03243909e6627e",
              "0x850bbd853553d4e63e7deae2b46c717f4898eb4cd2ab70b92074ba75e0669b28",
              "0x560bd9e5208ffab137318cb78dd22d022418ef05851559df6373184b6008d921",
              "0x68b994d4812451cd5dd0a6f79ec4af6c55bd81af96e80f398378827bfd2bfc79",
              "0xc8d2c46cfc54c6ee29c4ca9f11ff6775051d59b1c774fd2fa732f92236f535ba",
              "0xb706132112362fe076cca1c33cf4fef2e910f70fe2a453e45b710034059f1757",
              "0xb19912b950a53e2a6b16bfe2e8847f43ba7a3d15993701ebebe0e9c0971ca3dc",
              "0xcc8c01edc1360397cca04b87c4d94819da70fab718dc1c75cad7c43f82502d9e",
              "0x1a10b69ecdfb19ec88477595d14627de4335de63ee04d3273822cb571327f8a8",
              "0xcfab191eed98547c47065c6d3e5759306423f9c2610629adb5df336c7224bddb",
              "0xcf8fdcb00038d10d5fa3c847e4611ffee02ac20ee75ad45841451c9f1410e045",
              "0xe6d72fe86fbfa94a7e03e72d292f8d4bab188b18a4d732b500fc867d84bd86d6",
            ],
            "transactionsRoot": "0xe1aed9562570b4a0f31aebcc7558960f7aeafa3bd2a062977e2c927ff795af27",
            "uncles": [],
          },
        }
      `)
    expect(client.requests.size).toBe(0)
  })

  test('serial requests', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await client.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(forkBlockNumber - BigInt(i)), false],
          },
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        numberToHex(forkBlockNumber - BigInt(i)),
      ),
    )
    expect(client.requests.size).toBe(0)
  })

  test('parallel requests', async () => {
    await wait(500)

    await mine(testClient, { blocks: 100 })
    const blockNumber = await getBlockNumber(publicClient)

    const client = await getWebSocketRpcClient(localWsUrl)
    const response = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        return await client.requestAsync({
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
    expect(client.requests.size).toBe(0)
    await wait(500)
  }, 30_000)

  test('invalid request', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)
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
        "id": 127,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test.skip('timeout', async () => {
    const client = await getWebSocketRpcClient(localWsUrl)

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
      Version: viem@1.0.2]
    `,
    )
  })
})
