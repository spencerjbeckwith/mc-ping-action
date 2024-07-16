import { PingServer } from "./PingServer";

const server = new PingServer({
    expectedProtocolVersion: Number(process.env.EXPECTED_PROTOCOL_VERSION) || undefined,
    expectedServerAddress: process.env.EXPECTED_SERVER_ADDRESS,
    onPing: async (handshake) => {
        return {
            version: "1.14.4",
            description: "Server will be starting momentarily...",
        };
    },
});

server.listen(Number(process.env.PORT) || undefined);