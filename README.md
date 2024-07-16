# mc-ping-action

```
npm install
npm run start
```

A socket server that listens to server list ping requests from Minecraft clients, and runs an action when such a ping request is received. The intended purpose is to listen for the ping and use that as advance notice to start a server.

This, in conjunction with an automatic shutdown, has the potential to save a lot of costs on small-scale, frequently inactive servers. Depending on the chosen instance type and how much is played, this may even be cheaper than purchasing a Realm.

## Configuration

```
# TODO env
```

## Further Information

- More details on [server list ping](https://wiki.vg/Server_List_Ping)
- More details on [Minecraft multiplayer protocol](https://wiki.vg/Protocol)