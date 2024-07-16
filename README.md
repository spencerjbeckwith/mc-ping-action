# mc-ping-action

```
npm install
npm run start
```

A socket server that listens to server list ping requests from Minecraft clients, and runs an action when such a ping request is received. The intended purpose is to listen for the ping and use that as advance notice to start a server.

This, in conjunction with an automatic shutdown, has the potential to save a lot of costs on small-scale, frequently inactive servers. Depending on the chosen instance type and how many hours are played, this may even be cheaper than purchasing a Realm.

## Configuration

- `PORT`: (Optional) socket to listen on. Defaults to 25565, meaning the user will not need to specify a port.
- `EXPECTED_PROTOCOL_VERSION`: (Optional) if defined, the server will silently ignore any ping requests from an incorrect protocol version. This can be set to restrict this to certain versions of the game. [List of protocol versions per Minecraft version](https://wiki.vg/Protocol_version_numbers)
- `EXPECTED_SERVER_ADDRESS`: (Optional) if defined, the server will silently ignore any ping requests where the user-defined IP does not match the value. This can be set to restrict this to certain configured IPs or domain names.

## Further Information

- More details on [server list ping](https://wiki.vg/Server_List_Ping)
- More details on [Minecraft multiplayer protocol](https://wiki.vg/Protocol)