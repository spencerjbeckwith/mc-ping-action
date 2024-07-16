import { Server } from "net";
import { readVarInt } from "./utils";

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
}

export class PingServer {
    onPing: PingServerCallback;
    server: Server;
    constructor(options: PingServerOptions) {
        this.onPing = options.onPing;
        this.server = new Server(async (socket) => {
            socket.on("data", (data) => {
                // Decode the data in this packet
                let position = 0;

                // First, read our length
                let packetLengthResult = readVarInt(data, position);
                position += packetLengthResult.length;
                const packetLength = packetLengthResult.value

                // Now read packet ID
                const packetIDResult = readVarInt(data, position);
                position += packetIDResult.length;
                const packetID = packetIDResult.value;

                // TODO handle packet types
            });
        });
    }

    listen(port = 25565) {
        this.server.listen(port, () => {
            console.log(`Ping server listening on port ${port}.`);
        });
    }
}