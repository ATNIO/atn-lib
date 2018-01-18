const AtnLib = require('../')
// var test = require("tape")

var lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/"
  "ws://118.31.18.101:4046"
);

// test("getAiList", function (assert) {
//   lib.getAiList();
//   assert.end();
// })

async function run() {
  await lib.getAiList();
  await lib.getAiInfo(1);
  await lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
  await lib.getChannels('http://127.0.0.1:3000', 5437663);
  await lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5437663, 1)
  await lib.closeChannel('http://127.0.0.1:3000', "0x9765e2d8467334198b402e4d4551dd49e63327ec", 5138755, 0)
  await lib.getChannels('http://127.0.0.1:3000', 5176704)
  await lib.getPrice('http://127.0.0.1:3000', 'xiaoi')
  await lib.callAI(
    'http://127.0.0.1:3000',
    'xiaoi',
    'hi',
    '0x9765e2d8467334198b402e4d4551dd49e63327ec',
    5176704,
    2,
    1
  )
  await lib.directlyCallAI('XIAO_I', {
    question: "你好!"
  })
}

run();