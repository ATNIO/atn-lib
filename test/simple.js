const AtnLib = require('../')
const lib = new AtnLib(
  "***********************",
  "https://kovan.infura.io"
);

async function run() {
  const aiId = 5;
  const deposit = 9;
  const allAi = await lib.getAiList();
  console.log("allAi", allAi)
  const aiInfo = await lib.getAiInfo(aiId);
  console.log("aiInfo", aiInfo)
  const channel = await lib.openChannel(aiInfo.dbot_receiver, deposit);
  const block = channel[4];
  console.log("block", block);
  const topupChannel = await lib.topUpChannel(aiInfo.dbot_receiver, block, deposit);
  console.log("topupChannel", topupChannel);

  let input = {
    [aiInfo.params[0].name]: aiInfo.params[0].example
  };
  setTimeout(async() => {
    let balance = 0;
    const fee = await lib.getPrice(aiInfo.dbot_url, aiInfo.name);
    console.log("fee", fee);
    const res = await lib.callAI(
      aiInfo.dbot_url,
      aiInfo.name,
      input,
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

    const resDirectly = await lib.directlyCallAI(aiInfo.name, aiInfo.bill_kovan_addr, input);
    console.log("resDirectly", resDirectly);
    process.exit()
  }, 5000);
}


run();