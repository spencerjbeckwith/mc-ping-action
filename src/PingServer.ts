import { Server } from "net";
import { readVarInt, writeVarInt } from "./utils";
import { BufferStream } from "./BufferStream";

/** Packet of data from the client upon requesting a ping */
export interface PingHandshakeRequest {
    protocolVersion: number;
    serverAddress: string;
    serverPort: number;
    nextState: number;
}

/** Packet of data to be returned to the client */
export interface PingStatusResponse {
    /** Version of Minecraft that this server runs */
    version: string;

    /** MOTD to display in the multiplayer menu */
    description?: string;

    /** Base64-encoded 64x64 PNG image to use as the server's icon in the multiplayer menu */
    favicon?: string;
}

export type PingServerCallback = (handshake: PingHandshakeRequest) => Promise<PingStatusResponse>;

export interface PingServerOptions {
    /** Function that is called when a ping request is received */
    onPing: PingServerCallback;

    expectedProtocolVersion?: number;
    expectedServerAddress?: string;
}

export class PingServer {
    onPing: PingServerCallback;
    expectedProtocolVersion?: number;
    expectedServerAddress?: string;
    server: Server;
    constructor(options: PingServerOptions) {
        this.onPing = options.onPing;
        this.expectedProtocolVersion = options.expectedProtocolVersion;
        this.expectedServerAddress = options.expectedServerAddress;

        this.server = new Server((socket) => {
            socket.on("data", async (data) => {
                // Decode the data in this packet
                const d = new BufferStream(data);
                const packetLength = d.readVarInt();
                const packetID = d.readVarInt();
                switch (packetID) {
                    case (0): {
                        if (packetLength === 1) break; // Ignore status packets
                        const response = await this.handleHandshake(d);
                        if (response) {
                            socket.write(response);
                        }
                        break;
                    }
                    default: break;
                }
            });
        });
    }

    /** Handles handshake data and returns the buffer to return */
    async handleHandshake(d: BufferStream) {
        try {
            const protocolVersion = d.readVarInt();
            const serverAddress = d.readString();
            const serverPort = d.readUShort();
            const nextState = d.readVarInt();

            // Assert our protocol and server address are what we expect, if set
            let valid = true;
            if (this.expectedProtocolVersion) {
                if (this.expectedProtocolVersion !== protocolVersion) {
                    console.warn(`Unexpected protocol version: ${protocolVersion}`);
                    valid = false;
                }
            }
            if (this.expectedServerAddress) {
                if (this.expectedServerAddress !== serverAddress) {
                    console.warn(`Unexpected server address: ${serverAddress}`);
                    valid = false;
                }
            }

            if (valid) {
                const response = await this.onPing({
                    protocolVersion,
                    serverAddress,
                    serverPort,
                    nextState,
                });

                // Build our response JSON
                const json: any = {
                    version: {
                        name: response.version,
                        protocol: protocolVersion,
                    }   
                };
                if (response.description) {
                    json.description = {
                        text: response.description,
                    };
                }
                if (response.favicon) {
                    json.favicon = response.favicon;
                }
                const stringified = JSON.stringify(json);

                // Return our packet
                const jsonLength = writeVarInt(stringified.length);
                const packetLength = 1 + jsonLength.length + stringified.length;
                const packet = new Uint8Array([
                    ...writeVarInt(packetLength),
                    0x00,
                    ...jsonLength,
                    ...Buffer.from(stringified),
                ]);
                return packet;
            }
        } catch (err) {
            if (!(err instanceof RangeError)) {
                console.error(err);
            }
        }
    }

    listen(port = 25565) {
        this.server.listen(port, () => {
            console.log(`Ping server listening on port ${port}.`);
        });
    }
}