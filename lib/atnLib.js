const Web3 = require('web3');
const atn_artifacts = require('./data/contracts/ATN.json');
const biz_artifacts = require('./data/contracts/AIBusinessController.json');
const consumer_artifacts = require('./data/contracts/Consumer.json');
const uraiden_artifacts = require('./data/contracts/RaidenMicroTransferChannels.json');
const config = require('./data/config');
const rp = require('request-promise')
const sendTx = require("./sendTx")

class AtnLib {
  constructor(private_key, rpc_provider = 'http://localhost:8545') {
    this.private_key = private_key;
    this.web3 = new Web3(rpc_provider);
    this.senderAccount = this.web3.eth.accounts.privateKeyToAccount("0x" + this.private_key);
    this.sender = this.senderAccount.address.toLowerCase();
    this.web3.eth.accounts.wallet.add(this.senderAccount);
    this.uraiden = new this.web3.eth.Contract(uraiden_artifacts.abi, config.uraiden);
    this.atn = new this.web3.eth.Contract(atn_artifacts.abi, config.atn);
    this.biz = new this.web3.eth.Contract(biz_artifacts.abi, config.biz);
    this.consumer = new this.web3.eth.Contract(consumer_artifacts.abi, config.consumer);
    this.uraiden.options.from = this.sender;
    this.uraiden.options.gas = config.gas;
    this.uraiden.options.gasPrice = config.gasPrice;
    this.atn.options.from = this.sender;
    this.atn.options.gas = config.gas;
    this.atn.options.gasPrice = config.gasPrice;
    this.biz.options.from = this.sender;
    this.biz.options.gas = config.gas;
    this.biz.options.gasPrice = config.gasPrice;
    this.consumer.options.from = this.sender;
    this.consumer.options.gas = config.gas;
    this.consumer.options.gasPrice = config.gasPrice;
    this.decimals = 18;
    this.version = '1';
    this.apis = {
      'channels': `/uraiden/api/${this.version}/channels`,
      'callAI': `/ai/api/${this.version}/callAI`,
      'getPrice': `/bill/api/${this.version}/getPrice`
    }
  }

  num2bal(value) {
    return Math.floor(value * Math.pow(10, this.decimals));
  }

  bal2num(bal) {
    return bal && bal.div ?
      bal.div(Math.pow(10, this.decimals)) :
      bal / Math.pow(10, this.decimals);
  }

  encodeHex(str, zPadLength) {
    if (typeof str === "number") {
      str = str.toString(16);
    } else {
      str = [...str].map((char) =>
          char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    }
    return str.padStart(zPadLength, '0');
  }

  async numOfEth() {
    return this.bal2num(await this.web3.eth.getBalance(this.sender));
  }

  async numOfAtn() {
    return this.bal2num(await this.atn.methods.balanceOf(this.sender).call());
  }

  async getAiList(tags = []) {
    const opts = {
      uri: config.aimarket + config.apis.getAiList,
      qs: {
        tags,
      },
      json: true,
    }
    let res = await rp.get(opts);
    // console.log(res)
    return res;
  }

  async getAiInfo(id) {
    const opts = {
      uri: config.aimarket + config.apis.getAiInfo,
      qs: {
        id,
      },
      json: true,
    }
    let res = await rp.get(opts);
    // console.log(res)
    return res;
  }

  async openChannel(receiver, deposit) {
    deposit = this.num2bal(deposit);
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw new Error(`Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`);
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === 'function') {
      receipt = await sendTx(this.web3, this.atn, 'transfer(address,uint256,bytes)', [this.uraiden.options.address,
        deposit,
        receiver
      ]);
    } else {
      throw new Error("Method : transfer(address,uint256,bytes) Not Found")
    }
    // console.log(receipt);
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      receipt.blockNumber
    ).call();
    info['4'] = receipt.blockNumber;
    info['5'] = receiver;
    info['6'] = this.sender;
    // console.log(info)
    return info;
  }

  async topUpChannel(receiver, block, deposit) {
    deposit = this.num2bal(deposit);
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw new Error(`Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`);
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === "function") {
      receipt = await sendTx(this.web3, this.atn, 'transfer(address,uint256,bytes)', [this.uraiden.options.address,
        deposit,
        receiver + this.encodeHex(block, 8)
      ]);
    } else {
      throw new Error("Method : transfer(address,uint256,bytes) Not Found")
    }
    // console.log(receipt)
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      block
    ).call();
    info['4'] = block;
    info['5'] = receiver;
    info['6'] = this.sender;
    // console.log(info);
    return info;
  }

  async closeRequest(dbot_url, sender, block, balance) {
    const opts = {
      uri: `${dbot_url}${this.apis.channels}/${sender}/${block}`,
      body: {
        balance
      },
      json: true,
    }
    let res = await rp.delete(opts);
    // console.log(res);
    return res;
  }

  async signMessage(msg) {
    let sign = this.senderAccount.sign(msg);
    // console.log(sign);
    return sign.signature;
  }

  async signBalance(receiver, block, newBalance) {
    let msg = await this.uraiden.methods.getBalanceMessage(
      receiver,
      block,
      this.num2bal(newBalance)
    ).call();
    return await this.signMessage(msg);
  }

  async closeChannel(dbot_url, receiver, block, balance) {
    let res = await this.closeRequest(dbot_url, this.sender, block, balance);
    let closeSign = res.close_signature;
    let sign = await this.signBalance(receiver, block, balance);
    let params = [
      receiver,
      block,
      this.num2bal(balance),
      sign
    ];
    let paramsTypes = "address,uint32,uint192,bytes";
    if (closeSign) {
      params.push(closeSign);
      paramsTypes += ",bytes";
    }
    let receipt = await sendTx(this.web3, this.uraiden, 'close', params);
    // console.log(receipt);
    return receipt;
  }

  async settleChannel(receiver, block) {
    let receipt = await sendTx(this.web3, this.uraiden, 'settle', [receiver, block]);
    // console.log(receipt)
    return receipt;
  }

  async getChannels(dbot_url, block, status = 'open') {
    let uri = `${dbot_url}${this.apis.channels}/${this.sender}`;
    const opts = {
      uri,
      qs: {
        status,
        block
      },
      json: true,
    }
    let res = await rp.get(opts);
    // console.log(res);
    return res;
  }

  async callAI(dbot_url, ai_name, input, receiver, block, balance, price) {
    let newBalance = (+balance) + (+price);
    let sign = await this.signBalance(receiver, block, newBalance);
    let uri = `${dbot_url}${this.apis.callAI}`;
    let ai_id = ai_name;
    const opts = {
      uri,
      body: {
        ai_id,
        input,
        sender: this.sender,
        receiver,
        block,
        balance,
        price,
        sign
      },
      json: true,
    }
    let res = await rp.post(opts);
    // console.log(res);
    return res;
  }

  async getPrice(dbot_url, ai_name) {
    let uri = `${dbot_url}${this.apis.getPrice}`;
    const opts = {
      uri,
      qs: {
        ai_name,
        sender: this.sender
      },
      json: true,
    }
    let res = await rp.get(opts);
    // console.log(res);
    return res;
  }

  async directlyGetPrice(ai_name) {
    const aiID = this.web3.utils.asciiToHex(ai_name)
    const fee = await this.biz
      .methods
      .getPrice(aiID, this.sender).call();
    console.log("fee", fee);
    return fee;
  }

  async directlyCallAI(ai_name, bill_addr, input) {
    let fee = await this.directlyGetPrice(ai_name);
    console.log('============fee================');
    console.log(fee);

    const balance = await this.atn
      .methods
      .balanceOf(this.sender).call();
    console.log('============balance============');
    console.log(balance);
    if ((+fee) > +balance) {
      throw new Error("more balance is required!");
    }

    const allowance = await this.atn
      .methods
      .allowance(this.sender, bill_addr)
      .call();
    console.log('===========allowance===========')
    console.log(allowance)
    if ((+fee) > +allowance) {
      await sendTx(this.web3, this.atn, 'approve', [bill_addr, this.num2bal(+fee)]);
    }
    const args = JSON.stringify(input)
    const aiID = this.web3.utils.asciiToHex(ai_name)
    let tx;
    sendTx(this.web3, this.consumer, 'callAI', [aiID, args], (err, hash) => {
      if (err) console.error(err);
      console.log(`hash:${hash}`);
      tx = hash;
    });
    console.log('============callAI=============')
    let callID;
    this.biz.events.EventFundsFrozen({}, (err, res) => {
      console.log('===========frozenFunds============')
      console.log(res)
      if (!err && res.transactionHash === tx) {
        callID = res.returnValues._callID;
        console.log(callID)
      }
    })

    return new Promise((resolve, reject) =>{
      this.consumer.events.newCallback({}, (err, res) => {
        console.log('=============result===============')
        console.log(res)
        if (!err && callID == res.returnValues._callID) {
          console.log(res.returnValues._result)
          resolve(res.returnValues._result);
        }
      });
    })
  }

}


exports = module.exports = AtnLib;



