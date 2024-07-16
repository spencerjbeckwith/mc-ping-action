# mc-ping-action

```
npm install
npm run start
```

A socket server that listens to server list ping requests from Minecraft clients, and runs an action when such a ping request is received. The intended purpose is to listen for the ping and use that as advance notice to start a server.

This, in conjunction with an automatic shutdown, has the potential to save a lot of costs on small-scale, frequently inactive servers. Depending on the chosen instance type and how many hours are played, this may even be cheaper than purchasing a Realm.

## Configuration

All configuration is specified by environment variables in a `.env` file.

### Required

- `MINECRAFT_VERSION`: Version of Minecraft this server should advertise itself as.
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`: Should be set to the region containing the server instance.
- `SERVER_INSTANCE_ID`: ID of the Minecraft server itself in EC2

### Optional

- `PORT`: Socket to listen on. Defaults to 25565, meaning the user will not need to specify a port.
- `EXPECTED_PROTOCOL_VERSION`: If defined, the server will silently ignore any ping requests from an incorrect protocol version. This can be set to restrict this to certain versions of the game. [List of protocol versions per Minecraft version](https://wiki.vg/Protocol_version_numbers)
- `EXPECTED_SERVER_ADDRESS`: If defined, the server will silently ignore any ping requests where the user-defined IP does not match the value. This can be set to restrict this to certain configured IPs or domain names.

## Extension

If you want to perform some other kind of action on server ping, you can import and use the `PingServer` class - in the `onPing` callback you can add any sort of logic you want.

## Further Information

- More details on [server list ping](https://wiki.vg/Server_List_Ping)
- More details on [Minecraft multiplayer protocol](https://wiki.vg/Protocol)