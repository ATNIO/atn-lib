const AtnLib = require('../')
const lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/"
  "ws://118.31.18.101:4046"
);

async function run() {
  const aiId = 5;
  const deposit = 1;
  const allAi = await lib.getAiList();
  console.log("allAi", allAi)
  const aiInfo = await lib.getAiInfo(aiId);
  console.log("aiInfo", aiInfo)
  const channel = await lib.openChannel(aiInfo.dbot_receiver, deposit);
  const block = channel[4];
  console.log("block", block);
  const topupChannel = await lib.topUpChannel(aiInfo.dbot_receiver, block, deposit);
  console.log("topupChannel", topupChannel);

  setTimeout(async() => {
    let balance = 0;
    const fee = await lib.getPrice(aiInfo.dbot_url, aiInfo.name);
    console.log("fee", fee);
    const res = await lib.callAI(
      aiInfo.dbot_url,
      aiInfo.name,
      'hi',
      aiInfo.dbot_receiver,
      block,
      balance,
      fee
    );
    console.log("res", res);

    const channelInfo = await lib.getChannels(aiInfo.dbot_url, block);
    console.log("channelInfo", channelInfo);
    const closeRes = await lib.closeChannel(aiInfo.dbot_url, aiInfo.dbot_receiver, block, fee)
    console.log("closeRes", closeRes);

    const resDirectly = await lib.directlyCallAI('xiaoi', '0x77f0c5deccf15868da16d89dc67c4ab0c6aa0d19', {
      question: "hi"
    })
    console.log("resDirectly", resDirectly);
  }, 5000);

  // await lib.directlyCallAI('baiduOcr', '0xa99782d73844729822603bf1a7574389dd1427fc', {
  //   method: 'idcard',
  //   url: 'http://imgsrc.baidu.com/imgad/pic/item/bd3eb13533fa828bbd0022d9f61f4134970a5aec.jpg'
  // })

}


run();