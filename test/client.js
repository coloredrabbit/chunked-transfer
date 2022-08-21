// TODO: import from common.js
// environment values
const ENV = {
    MAGIC_NUMBER_BYTE_SIZE: 1,
    LENGTH_SECTION_BYTE_SIZE: 4,
};
Object.freeze(ENV);

// type
const ChunkedTransferMagicNumber = {
    JSON: 0,
    PLAIN: 1,
};
Object.freeze(ChunkedTransferMagicNumber);

class NotPreparedDataError extends Error {
    constructor() {
        super('Not yet prepared data to read');
    }
}

class ChunkedWritableStream {
    constructor(onParseBodyHandler){
        this.#onParseBodyHandler = onParseBodyHandler;

        this.#type = -1;
        this.#size = -1;

        this.#offset = 0;
        this.#buffer = new Uint8Array(0);
    }
    
    write(chunk) {
        console.log(chunk);

        var mergedBuffer = new Uint8Array(this.#buffer.length + chunk.length);
        mergedBuffer.set(this.#buffer);
        mergedBuffer.set(chunk, this.#buffer.length);
        this.#buffer = mergedBuffer;
        
        // TODO: implement promise.. ?
        try {
            while(true) {
                this.#magicNumberHandler();
                this.#sizeHandler();
                this.#bodyHandler();
            }
        } catch(e){
            if(e instanceof NotPreparedDataError) {
                // Please wait while downloading data from the stream. Do nothing.
            } else {
                console.error(e);
            }
        }
        
    }

    #onParseBodyHandler;

    #type = -1;
    #size = -1;

    #offset = 0;
    #buffer = new Uint8Array(0);

    #getIntegerFromBuffer(size, isLittleEndian = true){
        if(this.#buffer.length < this.#offset + size) {
            throw new NotPreparedDataError();
        }

        var view = new DataView(this.#buffer.buffer, this.#offset, size);
        this.#offset += size;
        
        if(size === 1) return view.getUint8(0, isLittleEndian);
        else if(size === 2) return view.getUint16(0, isLittleEndian);
        else if(size === 4) return view.getUint32(0, isLittleEndian);
        else {
             // Undefined behavior
        }
    }

    #magicNumberHandler() {
        this.#type = this.#getIntegerFromBuffer(ENV.MAGIC_NUMBER_BYTE_SIZE);
    }

    #sizeHandler() {
        this.#size = this.#getIntegerFromBuffer(ENV.LENGTH_SECTION_BYTE_SIZE);
    }

    #bodyHandler() {
        if(this.#buffer.length >= this.#offset + this.#size) {
            let raw = new TextDecoder().decode(this.#buffer.subarray(this.#offset, this.#offset + this.#size));
            let body = '';
            this.#offset += this.#size;
            
            if(this.#type === ChunkedTransferMagicNumber.JSON) {
                body = JSON.parse(raw);
            } else if(this.#type === ChunkedTransferMagicNumber.PLAIN) {
                body = raw;
            } else {
                // Undefined behavior
            }
            this.#onParseBodyHandler(body);

            this.#shiftBufferByOffset();
        } else {
            // Data not arrived completely.
            throw new NotPreparedDataError();
        }
    }
    
    #shiftBufferByOffset(){
        this.#buffer = new Uint8Array(this.#buffer.slice(this.#offset));
        this.#offset = 0;
    }
}

let chunkWritableStream = new ChunkedWritableStream((obj) => { 
    console.log(obj);
});
let chunkWritableStreamPipe = new WritableStream(chunkWritableStream);

const url = 'http://localhost:3001/list/items';
fetch(url, {
    method: 'GET',
    mode: 'no-cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    // headers: {
    //   'Content-Type': 'application/json',
    //   // 'Content-Type': 'application/x-www-form-urlencoded',
    // },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data), 
}).then(async res => {
    // res.body.getReader();
    // const reader = res.body.getReader();
    
    // return await reader.read().then(readChunks);

    return res.body
        // .pipeThrough(new TextDecoderStream())
        // .pipeThrough(upperCaseStream())
        .pipeTo(chunkWritableStreamPipe);
    

    // function upperCaseStream() {
    //     return new TransformStream({
    //         transform(chunk, controller) {
    //             controller.enqueue(chunk.toUpperCase());
    //         },
    //     });
    // }

    // readChunks() reads from the provided reader and yields the results into an async iterable
    // async function readChunks({ done, value }) {
    //     parser.chunkHandler(new Uint8Array(value));

    //     if(done){

    //         return;
    //     }
    //     window.myValue = value;
    //     console.log(value);
    //     return await reader.read().then(readChunks);
    // }
}).catch(e => {
    console.error(e);
})