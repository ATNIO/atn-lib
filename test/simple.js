const AtnLib = require('../')
const assert = require("assert")
const lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/"
  "http://118.31.18.101:4045"
);

// describe('atnLib', function() {
//   describe('#callAI()', function() {
//     it('test all api', async function() {
//       const lib = new AtnLib(
//         "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
//         // "https://kovan.infura.io/"
//         "http://118.31.18.101:4045"
//       );
//       const aiId = 1;
//       const allAi = await lib.getAiList();
//       const aiInfo = await lib.getAiInfo(aiId);
//       const filterAi = Array.from(allAi).filter(ai => 
//         ai.id == aiId
//       );
//       assert.equal(filterAi[0].id, aiInfo.id);

//       const channel = await lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
//       console.log(channel);
//     });
//   });
// });

async function run() {
  await lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
  // await lib.getChannels('http://127.0.0.1:4010', 5437663);
  // await lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5437663, 1)
  // await lib.closeChannel('http://127.0.0.1:3000', "0x9765e2d8467334198b402e4d4551dd49e63327ec", 5138755, 0)
  // await lib.getPrice('http://127.0.0.1:4018', 'azureVision')
  // await lib.callAI(
  //   'http://127.0.0.1:3000',
  //   'xiaoi',
  //   'hi',
  //   '0x9765e2d8467334198b402e4d4551dd49e63327ec',
  //   5176704,
  //   2,
  //   1
  // )
  // await lib.directlyCallAI('xiaoi', {
  //   question: "你好!"
  // })
  // await lib.directlyCallAI('baiduOcr', {
  //   method: 'idcard',
  //   url: 'http://imgsrc.baidu.com/imgad/pic/item/bd3eb13533fa828bbd0022d9f61f4134970a5aec.jpg'
  // })
}


run();