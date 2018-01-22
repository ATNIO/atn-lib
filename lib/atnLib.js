const Web3 = require('web3');
const atn_artifacts = require('./data/contracts/ATN.json');
const biz_artifacts = require('./data/contracts/AIBusinessController.json');
const consumer_artifacts = require('./data/contracts/Consumer.json');
const uraiden_artifacts = require('./data/contracts/RaidenMicroTransferChannels.json');
const config = require('./data/config');
const rp = require('request-promise')

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
    console.log(res)
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
    console.log(res)
    return res;
  }

  async openChannel(receiver, deposit) {
    deposit = this.num2bal(deposit);
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw new Error(`Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`);
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === 'function') {
      receipt = await this.atn.methods['transfer(address,uint256,bytes)'](
        this.uraiden.options.address,
        deposit,
        receiver
      ).send((err, hash) => {
        if (err) console.error(err);
        // console.log(`hash:${hash}`);
      });
    } else {
      await this.atn.methods.approve(
        this.uraiden.options.address,
        deposit
      ).send();
      receipt = await this.uraiden.methods.createChannelERC20(
        receiver,
        deposit
      ).send((err, hash) => {
        if (err) console.error(err);
        // console.log(`hash:${hash}`);
      });
    }
    // console.log(receipt);
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      receipt.blockNumber
    ).call();
    console.log(info)
    return info;
  }

  async topUpChannel(receiver, block, deposit) {
    deposit = this.num2bal(deposit);
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw new Error(`Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`);
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === "function") {
      receipt = await this.atn.methods['transfer(address,uint256,bytes)'](
        this.uraiden.options.address,
        deposit,
        receiver + this.encodeHex(block, 8) // receiver goes as 3rd param, 20 bytes, plus blocknumber, 4bytes        
      ).send((err, hash) => {
        if (err) console.error(err);
        // console.log(`hash:${hash}`);
      });
    } else {
      await this.atg.approve(
        this.uraiden.options.address,
        deposit
      ).send();
      receipt = await this.contract.topUpERC20(
        receiver,
        block,
        deposit
      ).send((err, hash) => {
        if (err) console.error(err);
        // console.log(`hash:${hash}`);
      });
    }
    // console.log(receipt)
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      block
    ).call();
    console.log(info);
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
    console.log(res);
    return res;
  }

  async signMessage(msg) {
    let sign = this.senderAccount.sign(msg);
    console.log(sign);
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
    let receipt = await this.uraiden.methods.close(
      ...params
    ).send();
    console.log(receipt);
    return receipt;
  }

  async settleChannel(receiver, block) {
    let receipt = await this.uraiden.methods.settle(
      receiver,
      block
    ).send((err, hash) => {
      if (err) console.error(err);
      console.log(`hash:${hash}`);
    });
    console.log(receipt)
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
    console.log(res);
    return res;
  }

  async callAI(dbot_url, ai_id, input, receiver, block, balance, price) {
    let newBalance = (+balance) + (+price);
    let sign = await this.signBalance(receiver, block, newBalance);
    let uri = `${dbot_url}${this.apis.callAI}`;
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
    console.log(res);
    return res;
  }

  async getPrice(dbot_url, ai_id) {
    let uri = `${dbot_url}${this.apis.getPrice}`;
    const opts = {
      uri,
      qs: {
        ai_id,
        sender: this.sender
      },
      json: true,
    }
    let res = await rp.get(opts);
    console.log(res);
  }

  async directlyGetPrice(ai_id) {
    const aiID = this.web3.utils.asciiToHex(ai_id)
    const fee = await this.biz
      .methods
      .getPrice(aiID, this.sender).call();
    console.log("fee", fee);
    return fee;
  }

  async directlyCallAI(ai_id, input) {

    let fee = await this.directlyGetPrice(ai_id);

    const balance = await this.atn
      .methods
      .balanceOf(this.sender).call();
    console.log('============balance============');
    console.log(balance);
    if (this.num2bal(+fee) > +balance) {
      throw new Error("more balance is required!");
    }

    const allowance = await this.atn
      .methods
      .allowance(this.sender, config.bill)
      .call();
    console.log('===========allowance===========')
    console.log(allowance)
    if (this.num2bal(+fee) > +allowance) {
      await this.atn
        .methods
        .approve(config.bill, fee)
        .send((err, hash) => {
          if (err) console.error(err);
          console.log(`hash:${hash}`);
        });
    }

    const args = JSON.stringify(input)
    const aiID = this.web3.utils.asciiToHex(ai_id)
    let tx;
    this.consumer
      .methods
      .callAI(aiID, args)
      .send((err, hash) => {
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

    this.consumer.events.newCallback({}, (err, res) => {
      console.log('=============result===============')
      if (!err && callID == res.returnValues._callID) {
        console.log(res.returnValues._result)
        return res.returnValues._result;
      }
    });
  }

}


exports = module.exports = AtnLib;