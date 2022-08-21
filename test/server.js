import express from 'express';
import { ChunkedTransferMagicNumber } from '../module/common.js';
import { ChunkedTransformStream } from '../module/chunked-transform-stream.js';

const port = 3001
const app = express();

const chunkedStream = new ChunkedTransformStream(ChunkedTransferMagicNumber.JSON);

app.get('/list/items', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    
    chunkedStream.pipe(res);

    // parser.write(Array(1000).fill('A').join(''));
    // await new Promise(r => setTimeout(r, 3000));
    // parser.write(Array(1000).fill('b').join(''));

    console.log(JSON.stringify(ChunkedTransferMagicNumber))
    chunkedStream.write(JSON.stringify(ChunkedTransferMagicNumber));
    await new Promise(r => setTimeout(r, 3000));
    var obj2 = { a: 10, b: 'll2'};
    chunkedStream.write(JSON.stringify(obj2));

    res.end();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})