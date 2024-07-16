const SEGMENT_BITS = 0x7f;
const CONTINUE_BIT = 0x80;

/** Reads a VarInt from a buffer, and returns the value of the VarInt as well as its length in bytes */
// Described: https://wiki.vg/Protocol#VarInt_and_VarLong
export function readVarInt(data: Buffer, from: number) {
    let value = 0;
    let position = 0;
    let byte: number;
    let offset = from;
    
    while (true) {
        byte = data.readUint8(offset);
        offset++;
        value |= (byte & SEGMENT_BITS) << position;
        if ((byte & CONTINUE_BIT) === 0) break;
        position += 7;
        if (position >= 32) {
            throw new Error("VarInt is too big!");
        }
    }

    return {
        value,
        length: offset - from,
    };
}

/** Converts a value into a VarInt, in the form of an array of bytes */
export function writeVarInt(value: number) {
    let bytes: number[] = [];
    while (true) {
        if ((value & ~SEGMENT_BITS) === 0) {
            bytes.push(value);
            break;
        }
        bytes.push((value & SEGMENT_BITS) | CONTINUE_BIT);
        value = value >> 7;
    }
    return bytes;
}