import { PingServer } from "./PingServer";
import fs from "fs";
import { EC2Client, DescribeInstancesCommand, StartInstancesCommand } from "@aws-sdk/client-ec2";

// Ensure our required config is set
const required = ["MINECRAFT_VERSION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "SERVER_INSTANCE_ID"];
const missing: string[] = [];
for (const key of required) {
    if (process.env[key] === undefined) {
        missing.push(key);
    }
}
if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s)! ${missing.join(", ")}`);
}

// Load our icons
const icons = {
    start: "assets/start.png",
    good: "assets/good.png",
    wait: "assets/wait.png",
    error: "assets/error.png",
};
for (const icon in icons) {
    const path = icons[icon as keyof typeof icons];
    console.log(`Loading image from ${path}...`);
    const buffer = fs.readFileSync(path);
    const base64 = buffer.toString("base64");
    icons[icon as keyof typeof icons] = `data:image/png;base64,${base64}`;
}

// Prep our AWS client
const ec2 = new EC2Client({
    region: process.env.AWS_REGION,
});

// Init our server
const server = new PingServer({
    expectedProtocolVersion: Number(process.env.EXPECTED_PROTOCOL_VERSION) || undefined,
    expectedServerAddress: process.env.EXPECTED_SERVER_ADDRESS,
    onPing: async (handshake) => {
        try {
            // Query our AWS instance
            const describe = new DescribeInstancesCommand({
                InstanceIds: [process.env.SERVER_INSTANCE_ID!],
            });
            const data = await ec2.send(describe);
            const instance = data.Reservations && data.Reservations[0].Instances && data.Reservations[0].Instances[0];
            if (!instance) {
                console.error("AWS response:", data);
                throw new Error("No AWS instance could be found! Is your instance ID set correctly?");
            }
            const state = instance.State?.Name;
            if (!state) {
                throw new Error("AWS instance does not include a state! Is your request correct?");
            }

            switch (state) {
                case ("running"): {
                    return {
                        version: process.env.MINECRAFT_VERSION!,
                        description: "Server is up and running!",
                        favicon: icons.good,
                    }
                }
                case ("stopped"): {
                    const start = new StartInstancesCommand({
                        InstanceIds: [process.env.SERVER_INSTANCE_ID!],
                    });
                    await ec2.send(start);
                    return {
                        version: process.env.MINECRAFT_VERSION!,
                        description: "Server is starting up now!",
                        favicon: icons.start,
                    }
                }
                case ("pending"): {
                    return {
                        version: process.env.MINECRAFT_VERSION!,
                        description: "Server is starting up, give it a sec...",
                        favicon: icons.start,
                    };
                }
                case ("stopping"): {
                    return {
                        version: process.env.MINECRAFT_VERSION!,
                        description: "Server is stopping. Try again shortly.",
                        favicon: icons.error,
                    }
                }
                default: {
                    return {
                        version: process.env.MINECRAFT_VERSION!,
                        description: "Uh oh, something is wrong with the server!",
                        favicon: icons.error,
                    }
                }
            }    
        } catch (err) {
            // If we got an error for some reason, return that
            console.error(err);
            return {
                version: process.env.MINECRAFT_VERSION!,
                description: "oops something's broken lmaooo",
                favicon: icons.error,
            }
        }
    },
});

server.listen(Number(process.env.PORT) || undefined);