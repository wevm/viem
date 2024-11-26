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

describe('getWebSocketRpcClient', () => {
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
})

describe('request', () => {
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
        "result": "anvil/v0.2.0",
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
          "baseFeePerGas": "0x20a0d339a",
          "blobGasUsed": "0x0",
          "difficulty": "0x0",
          "excessBlobGas": "0x0",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0xd05f46",
          "hash": "0x0c3e51fc62e1dd7401c8884882755b72e1c5720d0b01c75443cdfa8a129d3fc9",
          "logsBloom": "0xd123054441c15c9d30998061c8899fbdb40be9b00b9c9b73202d015aef6a92b80e6a1520ca498004de50db02f992518322199054de076a903019e47aa1a8b018a046a6c95d2d39a92c06e33ea9a225aa80c5408964c57f5fe083d5dc8a7051e5e92f4844e244023e90cc74c040236e49c31b9aa023596ec5aa1c0e1458593c036dbe9f7cbaa69538a2ed205c0ae2145e441b1319eb6946a9d82da46e6e9c0ca85f9688c6fa946b844bbdd4cc3f225ce09641d62220214a7cb9744c66340c807013f0315212455a000620a3b27359c8c13e1000130da23e141107d28a4900e1909470a80b03d746114b1596d3a4430b68b4ff3e219bac38d8dfa1680ae4005d4d",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x7702b2acc3443bd74c0b3ff142414f9d51e4caa0f111d57d319f4d46e21dedf7",
          "nonce": "0x0000000000000000",
          "number": "0x12f2974",
          "parentBeaconBlockRoot": "0xd472790dc1fd2d1b1cc9e208706266196f261e4c1a74f535d86981670c0d5f99",
          "parentHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "receiptsRoot": "0xe2822bc9663118439077ad806cd7a2a1a75bf1d70bf61d901199cf599c46f9d7",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0xdad8",
          "stateRoot": "0x115fd5eac921e6728825958b2b87da8aaf17edc0085164f11de798f6ed00abbd",
          "timestamp": "0x66434e43",
          "transactions": [
            "0x5d374a026007c13e901765497b9164d44822902463efdf7b574b10c476ee2ad6",
            "0x2762a7fb7c973e888edc457a3808d3882b5c8fc4f6c43a082d823319b126b91a",
            "0xe637d86545a9b508b373fdd46cc71682ac4a5dba222d7c9ac01380306cc96cd9",
            "0xecdfec41e9859fa217c5467debc9a5fa95290c3273f0ecf282f802983d2ca105",
            "0x75f544151f040710f96a2c8cd6da6cd7bb60e461bfc9b4f87d015562d9a55328",
            "0x07e609166382b05cd4cfd59764226374af8457a5dc0cea255721e5570cb32844",
            "0x08109ccb2b1609d10cd929594ba3a131d59c7aa6eb174cc7bf578670a8198405",
            "0x932fb264036b15e8a9704501e4f1ae34a9ac7543c498223c3456f03ebbefe221",
            "0x4773aaf55c914947aeefe6c996b961c900bddd82b4e809d47a5f99af22b014ef",
            "0x04d0728690604a7ec930782021704bb5d75d16d2c3330f8ab051348c906c52d4",
            "0x61d5fc3a8aa4f5e802dcd54a7fceaad89a97c873578b845ad12b34a96540aeb7",
            "0xd14bf1505356f83e55d4baffa315e0e9210479dff7486c4164a050c935d5bccf",
            "0x6c4e8a1e9484ad717ef42df12a6cb9655216b6a2f7420f52dc540ed952860fdb",
            "0x1d2361b3ec4fcb498732048e348fec130f15fb7e05187d8878985681c506b32a",
            "0xc3da74a44904c29c9046587cbade10386db5aed500d7ead58335a9757fc64c93",
            "0xc8632c7648b32e86023d8b585145bda62e5f8c160a5e6c8c02ec183297d05d2d",
            "0xb6a79dcd720a72d2ea5728a8e58885304202535b00861113dce00d07bca7f3ab",
            "0xc8b9a208eccabd84320946527cb1df897ec48318c1ca67e5fedc48388152518a",
            "0xd5b0feea2d8e474913d280c45c4a6e365ec2bd8ab09982f0b07a7e6e2e433526",
            "0xd67fa075f7abde07de71273e227856b43373276f18eb1446d1566cfafe896947",
            "0xca96b4905a5854d52f3152dc2f86b1e8ef0891ce82b8a6d0622d4470fa980c03",
            "0xd80b94b3d5e72e1cc74b3acbf6bec79bde51d6341f021a1259fe2e3303a919f4",
            "0x0e034d76d3593f1f07baf2452e337da912dfc06fd61704e658797eaf5c33222e",
            "0x755a7415073e029b231d575f935a10ae657eb30d3aa3edd32fcfc812ba2075b9",
            "0x082bebb8c90bc915b6931d6d135ae7016a41b01e6d07151b5d11d2e3cc15868c",
            "0x5a550298d163c3a6b1ca91412076781462a6e77825a7a34789e514f566a2ddd2",
            "0x7f5523181ea3b7b83577e2de0ff3edf0b7bed050436fd6958274a0a6882a487d",
            "0xc63aa388331f5016643dc4744dc47f0b79ac2dc30f2837f36058959de5c6d97b",
            "0xa1cdde08be62979fb2d51e3d1447e67ef9a72e7e9ad6c70834b6667ab4b25b2f",
            "0xeaf27f121d562cf7d6ba5fe04cb7477c2eae917f6ed0d254c474595334e1e61b",
            "0x4d3a2c0aa20291ec2a3e9663676770bb1cb1c33c8caa7308ec9b0e180df42039",
            "0x1f13065bd8d6bd0ff04592f8216576eb2ce38d766cf1fd4114392b4e622a7658",
            "0x220ce318063ac4496ba1e7946b78fd1574f95518ac920563531b124bbc3ec22d",
            "0x6c258638f3e25d325a1f73075a338ce02e57b4fac1b2a810a544d40b24e8b9f9",
            "0xa2a5fdce0672a32e04908e9a12a683697057855a33da8ab3cfc5275094f270fe",
            "0xfeb465bea0d19e832b87965440a36b3ea1d8bffda29d27ab72bf196f5a3954c0",
            "0x20b39aed43810bfc46a279f91e2814ae5a56906f7b7505c499850f2605c82dac",
            "0xd75f805748cdf37402c13b685d9dd9884ba1c0b0e3189f9f613a3a9ed223dbc8",
            "0x46bb82c63a8a2e29d01360f78d5ee871178847627774756ca6efc614c9710cee",
            "0x37a217624ca5724463612bc0a4f0943a3bf8599a05e9d4dc82da20bb0df79867",
            "0xca8ec3dfca0e43c79a9a32cdd8a01c161a8fbbed07d6f5b4231dc7b4086d1380",
            "0x12f7e01f6efcfb1c56bb3d4bf4358c32df847303c92d4f646996d4c601e1bd2f",
            "0x50a0a2e7abaeee10aa9ec6ca0303a019acd2b09279357a480fd37c2c03e177f1",
            "0x0c0134f6a1f68649f4777c86668ac2c3d348cd5ee9f71adaf5a783a3852a2e1c",
            "0x740fb5ab5762b25c2be2f3590cb0811d74b54dae5e40f52bf1e68c8fe2cb6e92",
            "0xa2218d513e2ca93a8acb3652d638af7be7e62711f48e81bf255fff3cfbe3a0dd",
            "0x413a7f87acffc04ef34261ae47737ab2f5f461d0af5d57269c5f6cdf78275159",
            "0x60d81ea9118a9d8075101f22e09d0646f155f23c2f4b84804f7ffc5afb203a68",
            "0x2ff7f513238717f264521c91bc457fb17800beda940eaf6d7e56b1c866b42c06",
            "0xda6dc1ae732e7ecbcac5765fc442fcee5a3617b5d575f5103b4fd9f706847c07",
            "0xf59ef60c1d9dda81fc22a8e985b6d3e589f512eb8b2518b3511a43908a460294",
            "0x81c6e17337cabd304c329a799b02e02245f37ece12a413f5c49282d18b1883cb",
            "0x18fb9299e78ffe36bfea65442d790288937a4d1d5b69138525dadaa70dc42367",
            "0x9db74bf461bb809717866699fb8b5d6bbe33b5bcc967dec46357331272e20df2",
            "0xc59eefbe4041f7dc7fdf2c86c9cfc0f1706993dcee80de6b27f25489cb8e10a9",
            "0x38b2207a133bfc3aec210fb386a199efb9087d13330fa0f637bfe37df59c312f",
            "0xd35ffbf38934b54a900e35c65c07fc3081993ebf5a55bc67977b73410abc211f",
            "0xa13e7a446c7f3ddaa8555c5d3437e8d827303b152a4dbb09ff01bde01a0585b0",
            "0x0bb1b3eea492459f2796fb9b3f7022417860f3a5450374220c0c9c3bd2e63512",
            "0xd9ebb04da1035f95bf3ed0bd06268f53737001f3f292ac825852875c57a6c4be",
            "0xe07cf18aa356d0134f2e0da6f68de7c9f28af854455fbdd38770b44be98a1dc6",
            "0x9be4c6c6a3c5622fcd0a1bbe13e21b8612eb39932f05b42972edf2ed184804dc",
            "0x9cf9a53f37175b3eba970af4b06a9fa98042e08882b2ed96dd285c0eaaa8e13c",
            "0x23f3b4e0dad22684741df92bba387be4e5c05414aca5bf54383e74a4b24b30eb",
            "0x4dcfcf6353596c9665fd94b7b9281b65e0a94b45f98ddff681db9ffc5c561602",
            "0x460b33043b87067727977ec7daea667bf440f482f0e77ab5a86745832c05d09e",
            "0x2fd8ab214c757b69349f10a86d94ccdae0a2c692f3408ea4d65bf5a58c710166",
            "0x6627f34e22dec201d70e4304375e60b0703a992610487356a7af6812c4ae89f0",
            "0x6a2ac6c7b4f140443ea9190beba68706aa0828055cc0a49c037f6bed4a3b94c9",
            "0xbadc35a3b5eb2524ddea54babbc6a7c531f94c845b499e2773f0d82f347976df",
            "0x258972ea1dced55b6b95ed07085de981786401d4da790000d7bd8739b0132cd9",
            "0x2b70ba122ab93b5b020a3e0ede3e5170d91b2fd8c429c4909b025a68e50a0a2a",
            "0xa1f2796fbf29d6cb19d541bb9e2ac1bdb8ecf4f64e9d4068a77b18325d736be8",
            "0x297b30d9b997e375d6d560c9670449c4ab9fc9e6cbfcfb094c659d053bd74fae",
            "0x4f2058432f7e90bde5ac4661e66dd4ddb4865a31a015b5da7a74f1ed682d4471",
            "0x88777368f2847a5a370cb5c6113b25841987168e1d60eff8f5e622b608c073b1",
            "0x4b6de4690fed6b924865cf234a94b74f8765c969d821bbddeb4333936c558aa9",
            "0x89db01005aa4cd9b60c481763f21dffe39a7ba2da6a4df80e1649fe71952ef70",
            "0x888b2ccb261734919308c792c458dcafbaf5ec09b35ff490b77e55304d8f6352",
            "0x847e03a9a940c74f151694bed14c82fc53eaaae5e4236e7f0525ab438f5e9d77",
            "0x176f3b0b49ee54ec554dc3a4dea00b3d115e48a8c0d5d3c6f328d7da8f6beff7",
            "0x009d634f81d6cbefe083d48d0741ab332f238bf496aafca838095e6fde0b541f",
            "0xaec2cd6a1cf8954187174f4a62c07b021293cac8b69d1b48cd206ba3244292ba",
            "0xc914a43546e51a0d4ab116e8fc86bd639c14b563474c9c247bb406404b6241c3",
            "0xdd7f4c16cc0512e308b521c944e11b852d652652656ba5c30589fbbd4454002d",
            "0x0329301ecb0cca138d687a07c3fc0e13358d10fb73f7ddac636fe1940d45be8b",
            "0x2f569a19dff21bc2674064a636b3f87689f3e0ed0ef69a0d99bbedb5721e154c",
            "0x06f42e2ae50574d560a495411ed504d3ca1c34ff5fe9f6f74a4327a9ada801f5",
            "0x04db2f50573f591543a42ad27ad89efe7182ff286b6d2c75e8787cdfd67682ad",
            "0xcac34907d292c7d1e8e307a3c669e9867977630b6667aa8ed0db0d0cb0e757f8",
            "0xe043631e0d3d42dfacb87783a95d9a7fb6d1b4a6b556ad5ffd9724dfec8a05dd",
            "0x163bd1073a5e99e886ae0ca8a469a58096e9992f772d8cf03c12897bc759ebf9",
            "0xe468530ce156f65bf52574d52c7b55489ae9a4a7bc3df7710e3ef8fd47d72386",
            "0xc19059a3d7e5f89c1bd674b798c5ff3860748acd9ccb7d684785358bc5a12d20",
            "0x73f819dd32e6679910453dafe4976b5724749fcd18407078e46864a22e47181d",
            "0xfe592761d1dc1bd893e0f8fdc548eaa3f5b441fda87ee71826d2d498a19b1f33",
            "0x291c84340609f89adc913f236425e23792af8728f6320f5e67f936384e02debc",
            "0x48aafb002e34c51e578c57e780ef52676301c44ce359c943238e56188c9be970",
            "0xb3790060ee3927e51a8415bf742287ed54fefd32e8e5e0e6e6d8327504f67e3f",
            "0x3fb1be8cec3734f7f261eee9bb67e16f89bd5e3836822cb30b79c3661fbbe00e",
            "0x32ca794db2e8bb3a6ce2fee48506541397112c3deea2dfe46deeae71ee9f663a",
            "0x81dc670fb945eb8c35b00b50f015fd9cef8c4560a855563364d01f2ef4508e14",
            "0xbd6556b6d46cca1b2b17a19a3a59c240b0ef3cf48a64dec4d3998c9cc24c1a8e",
            "0x90ad6135bfdf67e34c8f73238d31cc0986af1cb489bcfe81fc3eee05d9c29b97",
            "0x6e1cb115a90aabc2808bc7322acd7b3c34545f4aa8038f5c6d730da941c2e676",
            "0xf3f3af837c7e33b56008a0c04e8ab247210934cb6f3c5067e3a7a37f3e5dafe1",
            "0xc9d4ceee42f0ec528c1a63eb9d44098fd23beeedba9604f9e083afb2d505fdef",
            "0x17e4dea18b087b93f1215bcfad045ec54713658ebc484fe4e8986a771b0852a9",
            "0xfb649abb7e83c2cd08e1e30f0604d06186e3d34901206b1d4c409b26b0510d08",
            "0xcf248cf3701057459fc2347f9a9c3dc75332df6cfe002a8befe950ec2aa41b8c",
            "0xe355fea96b01d1f58a9ad11787f347ab05da938b8ae8355fb4a4811c1791ddf2",
            "0xf41a9728a3c5beb95bd54d48781fc5989608892c59cdf58545787581d7ef86a3",
            "0x974a1c129883d3d47d8faaae93cb8a0559b095ec5440f2e876b1ee12588be268",
            "0x7902398372de025e2a389ab30720d9219a48e0c843800fe2a117870b8588514e",
            "0x3858c51d5edd299685ce0ac9aa398d572eba7a25afe941580e9ff281f3ef4b96",
            "0x1a1a0c85194c4ceba80a6266fd6cf9977ace734c0bbe36fdb3f3b14fe185dbfc",
            "0xfc0faddbc7dfa5939e91d6759c1a58bc8fb19ee24fb19aa31d05cbf8cada3cf2",
            "0x99a9b35bfa30a6546895c6d134041b1564f7d404693619cf94fd6d5087559c2e",
            "0x9689c75b7fa465187f1723e96ae4a1092f6f6aa86e187882acced16882682e46",
            "0x70c6c50149f0bc6fd7c685bc9fab53dfd3f484a3c9bf206578951684a7e78d22",
            "0x1c2b3e1326bc24046d45e3c626ce5e865e9f0f4807f129994558caeccc7e4c40",
            "0x41491514a58d6db155b09d99c21e935f60aabdcb0b2bfd0ac3c7a66add88c8dc",
            "0x120d2916730adbd56c3a6fd6fd4618af561c81b73952b9f247ebd6fb0d253a01",
            "0xc65bb3d2984276ad902ed5d790cdbc5cfb953d5ff01dd0790532b2214dfb2f78",
            "0xbdf1cf02af245b580cf20f728fddfa39c6eb5b0ed70e0487c1074fbf28ebc0b0",
            "0xcbd578f01e8b5feba2ab69487c979e551c33ce2b73902c63943df9945dd23b9b",
            "0xc8c42876c9f093326fd24262be17af1ec0a1030693f7e4a24201c28b3b90d82c",
            "0x0b8839b2d0aa101cc2e8887c2d20c83d813559e7800f7ad9ce9af8be697a9a18",
            "0xf621df816c070c7f0091dda13b34e6a46a7a86dab6852500351d4f5e2ae9eefe",
            "0x8418a842e94ae25f54f427b389cee45d06da8cd3f55e41be9332c56241d48962",
            "0xac58a960f5db3cc0570a20f8ca307ef444d9a90f630c7b629e66e4313aad45b3",
            "0xf66d09329c4db75279f910ebe6d7a1c643632668a711dfb8069f47cf00d7a57a",
            "0xdcacf0e0951030d0f733cbbb46b5f0b3b45840953525b757001ceb74bae9fa4b",
            "0x941e10e4fde951acfbc184d76a51823b6ab04214b297e7e52bee236d8f66b8b9",
            "0xd1dd9fbed648c9d93f590a91ef9922b6256878a498e61055d8fec739395ce0e9",
            "0xe7eae47cd583cab13d7d684adc6e443ef38d83c7d2120171eecf7b0c9168a77b",
            "0x08a6ff7d42b3056bc571e9c16607b373d37565a71cac95b9a85bf5788f08ea0d",
            "0x3bae2e6ec6af9bbffe37b395df67769b234cdd743bd848764420ff2799ea673c",
            "0xaa0b772f59055d8dfbef446352b2d08fbacd97968643a300e03e520c50ffdcbf",
            "0xd8d29dfd14ab5068e615662b3580d191663f64cc15557873194d7b2718dc0425",
            "0x0561ae8390935eece56ca93e3ea5feaa187e3777418fc19134649726c9519f41",
            "0xe3c8dc3145997086caf05a06d4209d10096df09379fce4819f40c13cad005d3e",
            "0x02d87b27d2a9e5cb47a71051ef0ef3202e2a86373807753e8603807e43ecf4f5",
          ],
          "transactionsRoot": "0xec75fee6c90538b6b5d846f5fd25f550591eaccbb366fc393c4a693f8370d0b4",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11cdffd",
              "index": "0x2b3aa2b",
              "validatorIndex": "0x36315",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bee1f",
              "index": "0x2b3aa2c",
              "validatorIndex": "0x36316",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c8a4c",
              "index": "0x2b3aa2d",
              "validatorIndex": "0x36317",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bfb57",
              "index": "0x2b3aa2e",
              "validatorIndex": "0x36318",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11becdc",
              "index": "0x2b3aa2f",
              "validatorIndex": "0x36319",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c0882",
              "index": "0x2b3aa30",
              "validatorIndex": "0x3631a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c12c5",
              "index": "0x2b3aa31",
              "validatorIndex": "0x3631b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11caadf",
              "index": "0x2b3aa32",
              "validatorIndex": "0x3631c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c47d5",
              "index": "0x2b3aa33",
              "validatorIndex": "0x3631d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3c9a1eb",
              "index": "0x2b3aa34",
              "validatorIndex": "0x3631e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c1404",
              "index": "0x2b3aa35",
              "validatorIndex": "0x3631f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c22d9",
              "index": "0x2b3aa36",
              "validatorIndex": "0x36320",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c2dab",
              "index": "0x2b3aa37",
              "validatorIndex": "0x36321",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bfdf6",
              "index": "0x2b3aa38",
              "validatorIndex": "0x36322",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bafb3",
              "index": "0x2b3aa39",
              "validatorIndex": "0x36323",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b9154",
              "index": "0x2b3aa3a",
              "validatorIndex": "0x36324",
            },
          ],
          "withdrawalsRoot": "0x3f196863f2d0d52b020c33d1ac2fb588f257ac153baa09fbee2cc1cce42fadef",
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
        "id": 9,
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
      Request body: {"jsonrpc":"2.0","id":11,"method":"wagmi_lol"}

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
      Request body: {"jsonrpc":"2.0","id":13,"method":"wagmi_lol"}

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('request (subscription)', () => {
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
        "id": 33,
        "jsonrpc": "2.0",
      }
    `)
  })
})

describe('requestAsync', () => {
  test('valid request', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
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
          "baseFeePerGas": "0x20a0d339a",
          "blobGasUsed": "0x0",
          "difficulty": "0x0",
          "excessBlobGas": "0x0",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0xd05f46",
          "hash": "0x0c3e51fc62e1dd7401c8884882755b72e1c5720d0b01c75443cdfa8a129d3fc9",
          "logsBloom": "0xd123054441c15c9d30998061c8899fbdb40be9b00b9c9b73202d015aef6a92b80e6a1520ca498004de50db02f992518322199054de076a903019e47aa1a8b018a046a6c95d2d39a92c06e33ea9a225aa80c5408964c57f5fe083d5dc8a7051e5e92f4844e244023e90cc74c040236e49c31b9aa023596ec5aa1c0e1458593c036dbe9f7cbaa69538a2ed205c0ae2145e441b1319eb6946a9d82da46e6e9c0ca85f9688c6fa946b844bbdd4cc3f225ce09641d62220214a7cb9744c66340c807013f0315212455a000620a3b27359c8c13e1000130da23e141107d28a4900e1909470a80b03d746114b1596d3a4430b68b4ff3e219bac38d8dfa1680ae4005d4d",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x7702b2acc3443bd74c0b3ff142414f9d51e4caa0f111d57d319f4d46e21dedf7",
          "nonce": "0x0000000000000000",
          "number": "0x12f2974",
          "parentBeaconBlockRoot": "0xd472790dc1fd2d1b1cc9e208706266196f261e4c1a74f535d86981670c0d5f99",
          "parentHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "receiptsRoot": "0xe2822bc9663118439077ad806cd7a2a1a75bf1d70bf61d901199cf599c46f9d7",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0xdad8",
          "stateRoot": "0x115fd5eac921e6728825958b2b87da8aaf17edc0085164f11de798f6ed00abbd",
          "timestamp": "0x66434e43",
          "transactions": [
            "0x5d374a026007c13e901765497b9164d44822902463efdf7b574b10c476ee2ad6",
            "0x2762a7fb7c973e888edc457a3808d3882b5c8fc4f6c43a082d823319b126b91a",
            "0xe637d86545a9b508b373fdd46cc71682ac4a5dba222d7c9ac01380306cc96cd9",
            "0xecdfec41e9859fa217c5467debc9a5fa95290c3273f0ecf282f802983d2ca105",
            "0x75f544151f040710f96a2c8cd6da6cd7bb60e461bfc9b4f87d015562d9a55328",
            "0x07e609166382b05cd4cfd59764226374af8457a5dc0cea255721e5570cb32844",
            "0x08109ccb2b1609d10cd929594ba3a131d59c7aa6eb174cc7bf578670a8198405",
            "0x932fb264036b15e8a9704501e4f1ae34a9ac7543c498223c3456f03ebbefe221",
            "0x4773aaf55c914947aeefe6c996b961c900bddd82b4e809d47a5f99af22b014ef",
            "0x04d0728690604a7ec930782021704bb5d75d16d2c3330f8ab051348c906c52d4",
            "0x61d5fc3a8aa4f5e802dcd54a7fceaad89a97c873578b845ad12b34a96540aeb7",
            "0xd14bf1505356f83e55d4baffa315e0e9210479dff7486c4164a050c935d5bccf",
            "0x6c4e8a1e9484ad717ef42df12a6cb9655216b6a2f7420f52dc540ed952860fdb",
            "0x1d2361b3ec4fcb498732048e348fec130f15fb7e05187d8878985681c506b32a",
            "0xc3da74a44904c29c9046587cbade10386db5aed500d7ead58335a9757fc64c93",
            "0xc8632c7648b32e86023d8b585145bda62e5f8c160a5e6c8c02ec183297d05d2d",
            "0xb6a79dcd720a72d2ea5728a8e58885304202535b00861113dce00d07bca7f3ab",
            "0xc8b9a208eccabd84320946527cb1df897ec48318c1ca67e5fedc48388152518a",
            "0xd5b0feea2d8e474913d280c45c4a6e365ec2bd8ab09982f0b07a7e6e2e433526",
            "0xd67fa075f7abde07de71273e227856b43373276f18eb1446d1566cfafe896947",
            "0xca96b4905a5854d52f3152dc2f86b1e8ef0891ce82b8a6d0622d4470fa980c03",
            "0xd80b94b3d5e72e1cc74b3acbf6bec79bde51d6341f021a1259fe2e3303a919f4",
            "0x0e034d76d3593f1f07baf2452e337da912dfc06fd61704e658797eaf5c33222e",
            "0x755a7415073e029b231d575f935a10ae657eb30d3aa3edd32fcfc812ba2075b9",
            "0x082bebb8c90bc915b6931d6d135ae7016a41b01e6d07151b5d11d2e3cc15868c",
            "0x5a550298d163c3a6b1ca91412076781462a6e77825a7a34789e514f566a2ddd2",
            "0x7f5523181ea3b7b83577e2de0ff3edf0b7bed050436fd6958274a0a6882a487d",
            "0xc63aa388331f5016643dc4744dc47f0b79ac2dc30f2837f36058959de5c6d97b",
            "0xa1cdde08be62979fb2d51e3d1447e67ef9a72e7e9ad6c70834b6667ab4b25b2f",
            "0xeaf27f121d562cf7d6ba5fe04cb7477c2eae917f6ed0d254c474595334e1e61b",
            "0x4d3a2c0aa20291ec2a3e9663676770bb1cb1c33c8caa7308ec9b0e180df42039",
            "0x1f13065bd8d6bd0ff04592f8216576eb2ce38d766cf1fd4114392b4e622a7658",
            "0x220ce318063ac4496ba1e7946b78fd1574f95518ac920563531b124bbc3ec22d",
            "0x6c258638f3e25d325a1f73075a338ce02e57b4fac1b2a810a544d40b24e8b9f9",
            "0xa2a5fdce0672a32e04908e9a12a683697057855a33da8ab3cfc5275094f270fe",
            "0xfeb465bea0d19e832b87965440a36b3ea1d8bffda29d27ab72bf196f5a3954c0",
            "0x20b39aed43810bfc46a279f91e2814ae5a56906f7b7505c499850f2605c82dac",
            "0xd75f805748cdf37402c13b685d9dd9884ba1c0b0e3189f9f613a3a9ed223dbc8",
            "0x46bb82c63a8a2e29d01360f78d5ee871178847627774756ca6efc614c9710cee",
            "0x37a217624ca5724463612bc0a4f0943a3bf8599a05e9d4dc82da20bb0df79867",
            "0xca8ec3dfca0e43c79a9a32cdd8a01c161a8fbbed07d6f5b4231dc7b4086d1380",
            "0x12f7e01f6efcfb1c56bb3d4bf4358c32df847303c92d4f646996d4c601e1bd2f",
            "0x50a0a2e7abaeee10aa9ec6ca0303a019acd2b09279357a480fd37c2c03e177f1",
            "0x0c0134f6a1f68649f4777c86668ac2c3d348cd5ee9f71adaf5a783a3852a2e1c",
            "0x740fb5ab5762b25c2be2f3590cb0811d74b54dae5e40f52bf1e68c8fe2cb6e92",
            "0xa2218d513e2ca93a8acb3652d638af7be7e62711f48e81bf255fff3cfbe3a0dd",
            "0x413a7f87acffc04ef34261ae47737ab2f5f461d0af5d57269c5f6cdf78275159",
            "0x60d81ea9118a9d8075101f22e09d0646f155f23c2f4b84804f7ffc5afb203a68",
            "0x2ff7f513238717f264521c91bc457fb17800beda940eaf6d7e56b1c866b42c06",
            "0xda6dc1ae732e7ecbcac5765fc442fcee5a3617b5d575f5103b4fd9f706847c07",
            "0xf59ef60c1d9dda81fc22a8e985b6d3e589f512eb8b2518b3511a43908a460294",
            "0x81c6e17337cabd304c329a799b02e02245f37ece12a413f5c49282d18b1883cb",
            "0x18fb9299e78ffe36bfea65442d790288937a4d1d5b69138525dadaa70dc42367",
            "0x9db74bf461bb809717866699fb8b5d6bbe33b5bcc967dec46357331272e20df2",
            "0xc59eefbe4041f7dc7fdf2c86c9cfc0f1706993dcee80de6b27f25489cb8e10a9",
            "0x38b2207a133bfc3aec210fb386a199efb9087d13330fa0f637bfe37df59c312f",
            "0xd35ffbf38934b54a900e35c65c07fc3081993ebf5a55bc67977b73410abc211f",
            "0xa13e7a446c7f3ddaa8555c5d3437e8d827303b152a4dbb09ff01bde01a0585b0",
            "0x0bb1b3eea492459f2796fb9b3f7022417860f3a5450374220c0c9c3bd2e63512",
            "0xd9ebb04da1035f95bf3ed0bd06268f53737001f3f292ac825852875c57a6c4be",
            "0xe07cf18aa356d0134f2e0da6f68de7c9f28af854455fbdd38770b44be98a1dc6",
            "0x9be4c6c6a3c5622fcd0a1bbe13e21b8612eb39932f05b42972edf2ed184804dc",
            "0x9cf9a53f37175b3eba970af4b06a9fa98042e08882b2ed96dd285c0eaaa8e13c",
            "0x23f3b4e0dad22684741df92bba387be4e5c05414aca5bf54383e74a4b24b30eb",
            "0x4dcfcf6353596c9665fd94b7b9281b65e0a94b45f98ddff681db9ffc5c561602",
            "0x460b33043b87067727977ec7daea667bf440f482f0e77ab5a86745832c05d09e",
            "0x2fd8ab214c757b69349f10a86d94ccdae0a2c692f3408ea4d65bf5a58c710166",
            "0x6627f34e22dec201d70e4304375e60b0703a992610487356a7af6812c4ae89f0",
            "0x6a2ac6c7b4f140443ea9190beba68706aa0828055cc0a49c037f6bed4a3b94c9",
            "0xbadc35a3b5eb2524ddea54babbc6a7c531f94c845b499e2773f0d82f347976df",
            "0x258972ea1dced55b6b95ed07085de981786401d4da790000d7bd8739b0132cd9",
            "0x2b70ba122ab93b5b020a3e0ede3e5170d91b2fd8c429c4909b025a68e50a0a2a",
            "0xa1f2796fbf29d6cb19d541bb9e2ac1bdb8ecf4f64e9d4068a77b18325d736be8",
            "0x297b30d9b997e375d6d560c9670449c4ab9fc9e6cbfcfb094c659d053bd74fae",
            "0x4f2058432f7e90bde5ac4661e66dd4ddb4865a31a015b5da7a74f1ed682d4471",
            "0x88777368f2847a5a370cb5c6113b25841987168e1d60eff8f5e622b608c073b1",
            "0x4b6de4690fed6b924865cf234a94b74f8765c969d821bbddeb4333936c558aa9",
            "0x89db01005aa4cd9b60c481763f21dffe39a7ba2da6a4df80e1649fe71952ef70",
            "0x888b2ccb261734919308c792c458dcafbaf5ec09b35ff490b77e55304d8f6352",
            "0x847e03a9a940c74f151694bed14c82fc53eaaae5e4236e7f0525ab438f5e9d77",
            "0x176f3b0b49ee54ec554dc3a4dea00b3d115e48a8c0d5d3c6f328d7da8f6beff7",
            "0x009d634f81d6cbefe083d48d0741ab332f238bf496aafca838095e6fde0b541f",
            "0xaec2cd6a1cf8954187174f4a62c07b021293cac8b69d1b48cd206ba3244292ba",
            "0xc914a43546e51a0d4ab116e8fc86bd639c14b563474c9c247bb406404b6241c3",
            "0xdd7f4c16cc0512e308b521c944e11b852d652652656ba5c30589fbbd4454002d",
            "0x0329301ecb0cca138d687a07c3fc0e13358d10fb73f7ddac636fe1940d45be8b",
            "0x2f569a19dff21bc2674064a636b3f87689f3e0ed0ef69a0d99bbedb5721e154c",
            "0x06f42e2ae50574d560a495411ed504d3ca1c34ff5fe9f6f74a4327a9ada801f5",
            "0x04db2f50573f591543a42ad27ad89efe7182ff286b6d2c75e8787cdfd67682ad",
            "0xcac34907d292c7d1e8e307a3c669e9867977630b6667aa8ed0db0d0cb0e757f8",
            "0xe043631e0d3d42dfacb87783a95d9a7fb6d1b4a6b556ad5ffd9724dfec8a05dd",
            "0x163bd1073a5e99e886ae0ca8a469a58096e9992f772d8cf03c12897bc759ebf9",
            "0xe468530ce156f65bf52574d52c7b55489ae9a4a7bc3df7710e3ef8fd47d72386",
            "0xc19059a3d7e5f89c1bd674b798c5ff3860748acd9ccb7d684785358bc5a12d20",
            "0x73f819dd32e6679910453dafe4976b5724749fcd18407078e46864a22e47181d",
            "0xfe592761d1dc1bd893e0f8fdc548eaa3f5b441fda87ee71826d2d498a19b1f33",
            "0x291c84340609f89adc913f236425e23792af8728f6320f5e67f936384e02debc",
            "0x48aafb002e34c51e578c57e780ef52676301c44ce359c943238e56188c9be970",
            "0xb3790060ee3927e51a8415bf742287ed54fefd32e8e5e0e6e6d8327504f67e3f",
            "0x3fb1be8cec3734f7f261eee9bb67e16f89bd5e3836822cb30b79c3661fbbe00e",
            "0x32ca794db2e8bb3a6ce2fee48506541397112c3deea2dfe46deeae71ee9f663a",
            "0x81dc670fb945eb8c35b00b50f015fd9cef8c4560a855563364d01f2ef4508e14",
            "0xbd6556b6d46cca1b2b17a19a3a59c240b0ef3cf48a64dec4d3998c9cc24c1a8e",
            "0x90ad6135bfdf67e34c8f73238d31cc0986af1cb489bcfe81fc3eee05d9c29b97",
            "0x6e1cb115a90aabc2808bc7322acd7b3c34545f4aa8038f5c6d730da941c2e676",
            "0xf3f3af837c7e33b56008a0c04e8ab247210934cb6f3c5067e3a7a37f3e5dafe1",
            "0xc9d4ceee42f0ec528c1a63eb9d44098fd23beeedba9604f9e083afb2d505fdef",
            "0x17e4dea18b087b93f1215bcfad045ec54713658ebc484fe4e8986a771b0852a9",
            "0xfb649abb7e83c2cd08e1e30f0604d06186e3d34901206b1d4c409b26b0510d08",
            "0xcf248cf3701057459fc2347f9a9c3dc75332df6cfe002a8befe950ec2aa41b8c",
            "0xe355fea96b01d1f58a9ad11787f347ab05da938b8ae8355fb4a4811c1791ddf2",
            "0xf41a9728a3c5beb95bd54d48781fc5989608892c59cdf58545787581d7ef86a3",
            "0x974a1c129883d3d47d8faaae93cb8a0559b095ec5440f2e876b1ee12588be268",
            "0x7902398372de025e2a389ab30720d9219a48e0c843800fe2a117870b8588514e",
            "0x3858c51d5edd299685ce0ac9aa398d572eba7a25afe941580e9ff281f3ef4b96",
            "0x1a1a0c85194c4ceba80a6266fd6cf9977ace734c0bbe36fdb3f3b14fe185dbfc",
            "0xfc0faddbc7dfa5939e91d6759c1a58bc8fb19ee24fb19aa31d05cbf8cada3cf2",
            "0x99a9b35bfa30a6546895c6d134041b1564f7d404693619cf94fd6d5087559c2e",
            "0x9689c75b7fa465187f1723e96ae4a1092f6f6aa86e187882acced16882682e46",
            "0x70c6c50149f0bc6fd7c685bc9fab53dfd3f484a3c9bf206578951684a7e78d22",
            "0x1c2b3e1326bc24046d45e3c626ce5e865e9f0f4807f129994558caeccc7e4c40",
            "0x41491514a58d6db155b09d99c21e935f60aabdcb0b2bfd0ac3c7a66add88c8dc",
            "0x120d2916730adbd56c3a6fd6fd4618af561c81b73952b9f247ebd6fb0d253a01",
            "0xc65bb3d2984276ad902ed5d790cdbc5cfb953d5ff01dd0790532b2214dfb2f78",
            "0xbdf1cf02af245b580cf20f728fddfa39c6eb5b0ed70e0487c1074fbf28ebc0b0",
            "0xcbd578f01e8b5feba2ab69487c979e551c33ce2b73902c63943df9945dd23b9b",
            "0xc8c42876c9f093326fd24262be17af1ec0a1030693f7e4a24201c28b3b90d82c",
            "0x0b8839b2d0aa101cc2e8887c2d20c83d813559e7800f7ad9ce9af8be697a9a18",
            "0xf621df816c070c7f0091dda13b34e6a46a7a86dab6852500351d4f5e2ae9eefe",
            "0x8418a842e94ae25f54f427b389cee45d06da8cd3f55e41be9332c56241d48962",
            "0xac58a960f5db3cc0570a20f8ca307ef444d9a90f630c7b629e66e4313aad45b3",
            "0xf66d09329c4db75279f910ebe6d7a1c643632668a711dfb8069f47cf00d7a57a",
            "0xdcacf0e0951030d0f733cbbb46b5f0b3b45840953525b757001ceb74bae9fa4b",
            "0x941e10e4fde951acfbc184d76a51823b6ab04214b297e7e52bee236d8f66b8b9",
            "0xd1dd9fbed648c9d93f590a91ef9922b6256878a498e61055d8fec739395ce0e9",
            "0xe7eae47cd583cab13d7d684adc6e443ef38d83c7d2120171eecf7b0c9168a77b",
            "0x08a6ff7d42b3056bc571e9c16607b373d37565a71cac95b9a85bf5788f08ea0d",
            "0x3bae2e6ec6af9bbffe37b395df67769b234cdd743bd848764420ff2799ea673c",
            "0xaa0b772f59055d8dfbef446352b2d08fbacd97968643a300e03e520c50ffdcbf",
            "0xd8d29dfd14ab5068e615662b3580d191663f64cc15557873194d7b2718dc0425",
            "0x0561ae8390935eece56ca93e3ea5feaa187e3777418fc19134649726c9519f41",
            "0xe3c8dc3145997086caf05a06d4209d10096df09379fce4819f40c13cad005d3e",
            "0x02d87b27d2a9e5cb47a71051ef0ef3202e2a86373807753e8603807e43ecf4f5",
          ],
          "transactionsRoot": "0xec75fee6c90538b6b5d846f5fd25f550591eaccbb366fc393c4a693f8370d0b4",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11cdffd",
              "index": "0x2b3aa2b",
              "validatorIndex": "0x36315",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bee1f",
              "index": "0x2b3aa2c",
              "validatorIndex": "0x36316",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c8a4c",
              "index": "0x2b3aa2d",
              "validatorIndex": "0x36317",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bfb57",
              "index": "0x2b3aa2e",
              "validatorIndex": "0x36318",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11becdc",
              "index": "0x2b3aa2f",
              "validatorIndex": "0x36319",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c0882",
              "index": "0x2b3aa30",
              "validatorIndex": "0x3631a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c12c5",
              "index": "0x2b3aa31",
              "validatorIndex": "0x3631b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11caadf",
              "index": "0x2b3aa32",
              "validatorIndex": "0x3631c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c47d5",
              "index": "0x2b3aa33",
              "validatorIndex": "0x3631d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x3c9a1eb",
              "index": "0x2b3aa34",
              "validatorIndex": "0x3631e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c1404",
              "index": "0x2b3aa35",
              "validatorIndex": "0x3631f",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c22d9",
              "index": "0x2b3aa36",
              "validatorIndex": "0x36320",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11c2dab",
              "index": "0x2b3aa37",
              "validatorIndex": "0x36321",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bfdf6",
              "index": "0x2b3aa38",
              "validatorIndex": "0x36322",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bafb3",
              "index": "0x2b3aa39",
              "validatorIndex": "0x36323",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b9154",
              "index": "0x2b3aa3a",
              "validatorIndex": "0x36324",
            },
          ],
          "withdrawalsRoot": "0x3f196863f2d0d52b020c33d1ac2fb588f257ac153baa09fbee2cc1cce42fadef",
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
        "id": 153,
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
})
