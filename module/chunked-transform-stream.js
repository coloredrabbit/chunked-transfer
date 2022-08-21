import { ENV, ChunkedTransferMagicNumber } from './common.js';
import { Transform } from 'stream';

// error
export class NotAllowedChunkedTypeError extends Error {
    constructor() {
        super('Not allowed chunked type error.');
    }
}

export class ChunkedTransformStream extends Transform {
    #type;
    constructor(type){
        super();
        if(!(type in ChunkedTransferMagicNumber)) {
            throw new NotAllowedChunkedTypeError();
        }
        this.#type = type;
    }

    _transform(chunk, encoding, done) {
        this.push(this.#getChunkType(), 'utf-8');
        this.push(this.#getLengthSection(chunk), 'utf-8');
        this.push(chunk.toString(), 'utf-8');

        done(null);
    }
    #getHexaLittleEndian(n, size){
        var buffer = Buffer.alloc(size, 0);
        if(size === 1) buffer.writeUInt8(n, 0);
        else if(size === 2) buffer.writeUInt16LE(n, 0);
        else if(size === 4) buffer.writeUInt32LE(n, 0);
        else { /* Undefined behavior */ }

        return buffer;
    }
    #getChunkType() {
        return this.#getHexaLittleEndian(this.#type, ENV.MAGIC_NUMBER_BYTE_SIZE);
    }
    #getLengthSection(data){
        let length = 0;
        if(this.#type === ChunkedTransferMagicNumber.JSON) {
            length = data.length;
        } else if(this.#type === ChunkedTransferMagicNumber.PLAIN) {
            length = data.length;
        } else { /* Undefined behavior */ }

        let lengthLE = this.#getHexaLittleEndian(length, ENV.LENGTH_SECTION_BYTE_SIZE);
        return lengthLE;
    }
};