// environment values
export const ENV = {
    MAGIC_NUMBER_BYTE_SIZE: 1,
    LENGTH_SECTION_BYTE_SIZE: 4,
};
Object.freeze(ENV);

// type
export const ChunkedTransferMagicNumber = {
    JSON: 0,
    PLAIN: 1,
    0: 'JSON',
    1: 'PLAIN'
};
Object.freeze(ChunkedTransferMagicNumber);