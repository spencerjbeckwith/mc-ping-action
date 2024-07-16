import { PingServer } from "./PingServer";

const server = new PingServer({
    onPing: async (handshake) => {
        return {
            version: "1.14.4",
        };
    },
});

server.listen();