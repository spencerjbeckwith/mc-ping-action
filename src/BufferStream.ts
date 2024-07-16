import { readVarInt } from "./utils";

/** Buffer wrapping class including an automatically-advancing cursor, to make it easier to read bytes in order */
export class BufferStream {
    buffer: Buffer;
    position: number;
    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.position = 0;
    }

    readVarInt() {
        const result = readVarInt(this.buffer, this.position);
        this.position += result.length;
        return result.value;
    }

    readString() {
        const length = this.readVarInt();
        const string = this.buffer.subarray(this.position, this.position + length);
        this.position += length;
        return string.toString("utf-8");
    }

    readUShort() {
        const short = this.buffer.readUint16BE(this.position);
        this.position += 2;
        return short;
    }
}