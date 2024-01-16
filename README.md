# BHG-Arbitrage-bot-BSC version

This is Multi Dex arbitrage bot between Pancakeswap , Biswap and Apeswap
## Usage
======================

1. input variable to src/components/config.js
    please input you wallet address and wallet private key.
```
        export const walletAddress = ""
        export const walletPrivate = ""
        export const addressdatabaseurl  = "BSCTokenAddress"
        export const logdatabaseurl = "BSClog"
        export const web3url = "https://bsc-dataseed1.ninicoin.io"
        export const uniswap = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
        export const sushiswap = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8"
        export const defiswap = "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F"
        export const wethaddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        export const autoProfit = "0.5" 
        export const autoAmount = "1"
        export const autotime = "60000"
        export const autoGasLimit = "500000"
        export const autoGasValue = "50"
        export const autoSlippage = "100"
```

1. install Dapp's enviroments(node_module) 
```
$ npm install
```
2. run dapp
```
$ npm run start

```
next step run Dapp and input your token address to be listed.
3.  input trade amount and press get amount buttton for getting price of tokens from each Dex.
4.  input your wallet address and private key.(if you don't input your wallet address and private key to address)
5.  Press start auto trade button and, in modal input interval, slippage and profit limit. and start.
6.  in log channel you can check about transaction's detail informations
This Dapp for mainnet, So if you want test on testnet please modifiy some variables. web3url, and other addresses.