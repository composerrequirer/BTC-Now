"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { get } = require('axios');
const Express = require('express');
const { promisify } = require('util');
const { readFile } = require('fs');
const port = 5000;
const readAsync = promisify(readFile);
const app = new Express();
async function getPrices(currencySymble) {
    let test = await get(`https://api.binance.com/api/v3/ticker/price?symbol=BTC${currencySymble}`);
    return test.data;
}
async function sendInfo(req, res) {
    let btcUsdPrice = await getPrices("USDT");
    let btcBrlPrice = await getPrices("BRL");
    let pricesObj = { btcToBrl: btcBrlPrice.price, btcToUsd: btcUsdPrice.price };
    res.write(`data: ${JSON.stringify(pricesObj)} \n\n`);
}
app.get('/', async (req, res) => {
    let home = await readAsync("../views/index.html", 'utf-8');
    res.send(home);
});
app.get('/register', async (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        // "Connection": "keep-alive",
        "Cache-Control": "no-cache"
    });
    // res.flushHeaders();
    res.flushHeaders();
    // From here we can send sse's with res.write:
    // Sending first info on page load:
    sendInfo(req, res);
    // Keeping info up to date:
    setInterval(async () => {
        sendInfo(req, res);
    }, 60000);
});
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});
