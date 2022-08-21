// import { ENV, ChunkedTransferMagicNumber } from './common';

// export class ChunkedWritableStream {
    
//     #type;
//     #offset;
//     #size;

//     #buffer;
//     #onParseBodyHandler;

//     #done
//     constructor(onParseBodyHandler){
//         // super();

//         this.#onParseBodyHandler = onParseBodyHandler;

//         this.#type = -1;
//         this.#size = -1;

//         this.#offset = 0;
//         this.#done = false;
//         this.#buffer = new Uint8Array(0);
//     }

//     write(chunk) {
//         // if(done) {
//         //     this.#done = true;
//         // }
//         console.log(chunk);

//         var mergedBuffer = new Uint8Array(this.#buffer.length + chunk.length);
//         mergedBuffer.set(this.#buffer);
//         mergedBuffer.set(chunk, this.#buffer.length);
//         this.#buffer = mergedBuffer;
//         console.log(this.#buffer);
//         // this.#buffer = Uint8Array.from([...this.#buffer, ...chunk]);

//         // TODO: implement promise.. ?
//         this.magicNumberHandler();
//         if(this.#type != -1){
//             this.sizeHandler();
//             if(this.#size != -1) {
//                 this.bodyHandler();

//                 // TODO: resize buffer after parse body
                
//             }
//         }

//         console.log('type', this.#type);
//         console.log('size', this.#size);
//         console.log('offset', this.#offset);

//         window.myBuffer = this.#buffer;
//     }

//     popBuffer(size){
//         this.#buffer = this.#buffer.subarray(size);
//     }

//     getIntegerFromBuffer(size, isLittleEndian = true){
//         if(this.#buffer.length < this.#offset + size) {
//             // TODO: cannot read. throw error
//             return -1;
//         }

//         var view = new DataView(this.#buffer.buffer, this.#offset, size);
//         this.#offset += size;
        
//         if(size === 1) return view.getUint8(0, isLittleEndian);
//         else if(size === 2) return view.getUint16(0, isLittleEndian);
//         else if(size === 4) return view.getUint32(0, isLittleEndian);
//         else {
//              // TODO: throw error 
//              return -1;
//         }
//     }

//     magicNumberHandler() {
//         this.#type = this.getIntegerFromBuffer(ENV.MAGIC_NUMBER_BYTE_SIZE);
//     }
//     sizeHandler() {
//         this.#size = this.getIntegerFromBuffer(ENV.LENGTH_SECTION_BYTE_SIZE);
//     }

//     bodyHandler() {
//         if(this.#buffer.length >= this.#offset + this.#size) {
//             let raw = new TextDecoder().decode(this.#buffer.subarray(this.#offset, this.#offset + this.#size));
//             let body = '';
//             this.#offset += this.#size;
//             console.log(raw);
//             if(this.#type === ChunkedTransferMagicNumber.JSON) {
//                 body = JSON.parse(raw);
//             } else if(this.#type === ChunkedTransferMagicNumber.PLAIN) {
//                 body = raw;
//             } else {
//                 // TODO: throw error
//             }
//             this.#onParseBodyHandler(body);

//             this.shiftBuffer();
//         } else {
//             // Data not arrived completely. Do nothing.
//         }
//     }
    
//     shiftBuffer(){
//         this.#buffer = new Uint8Array(this.#buffer.slice(this.#offset));
//         this.#offset = 0;

//         console.log('clear');
//         console.log(this.#buffer);
//     }
// }