# Ma Sói Online WebSocket Contract

## TTT-57 final connect, snapshot, and presence

Clients send exactly `{"playerId":"...","playerToken":"..."}` to `/app/rooms/{roomCode}/connect`. Authentication failures close the current STOMP connection with a terminal `ERROR` frame whose JSON body is exactly `{"code":"SOCKET_AUTH_FAILED"}` and whose optional generic `message` header is `SOCKET_AUTH_FAILED`. The frame exposes no authentication reason, credentials, Room, Redis, or internal implementation data. No additional error destination or subscription is used; the frontend clears only the matching room session and stops reconnecting.

The player destination receives complete snapshots only on `/broadcast/rooms/{roomCode}/players`: `{"roomCode":"A7K9Q2","status":"WAITING","currentPlayers":2,"maxPlayers":6,"players":[{"playerId":"...","playerName":"...","isConnected":true}]}`.

Presence is Redis-backed and outside Room JSON. Reconnect replaces the current session. A stale old-session disconnect cannot remove a new session; current disconnect preserves membership and broadcasts a new snapshot. No additional public destination is used.

## TTT-66 final disconnect and reconnect lifecycle

A current-session disconnect immediately publishes a complete snapshot on the existing player destination with the same Room membership and `currentPlayers`; the disconnected Player has `isConnected=false`. Membership and authentication are retained for a 10-second in-memory grace period.

An authenticated reconnect during grace keeps the same `playerId`, Room membership, Player order, and count, replaces session ownership, invalidates pending removal, and publishes the complete connected snapshot. Cancellation is best-effort; ownership tokens ensure a stale session or scheduled task cannot remove an active replacement.

When grace expires without a reconnect, the Room Service acquires the shared Room lock, removes exactly that Player from Room membership, then removes that Player's exact authentication key. It publishes a complete final snapshot without the removed Player. The old credentials subsequently receive the same terminal `{"code":"SOCKET_AUTH_FAILED"}` response. No new destination or public payload field is introduced.

Pending removal exists only in process memory; there is no Redis pending-removal key. Restart recovery, heartbeat, TTL, crash detection, and abandoned-session cleanup remain deferred to TTT-166.

## Source of truth

1. Locked project decisions approved by the team.
2. This reviewed shared contract.
3. Current implementation only as evidence.
4. Legacy chat destinations are not authoritative.

## Ownership

- Kiên owns the WebSocket server, STOMP handling, session mapping, and connect/disconnect/reconnect behavior.
- Trung may document this contract and later wire the Gateway, but must not modify Kiên's implementation in TTT-11.
- Thứ must review the start-game and end-game integration boundaries.

## SockJS endpoint

- `/ws`

## Client sends

- `/app/rooms/{roomCode}/connect`

## Client subscribes

- `/broadcast/rooms/{roomCode}/players`

## TTT-75 player game events

The existing SockJS endpoint `/ws`, lobby connect destination `/app/rooms/{roomCode}/connect`, snapshot destination `/broadcast/rooms/{roomCode}/players`, snapshot payload, and terminal `{"code":"SOCKET_AUTH_FAILED"}` contract remain unchanged.

### Private start delivery

An authenticated Player subscribes to:

```text
/broadcast/distribution/rooms/{roomCode}/start-game/{playerId}
```

The `SUBSCRIBE` frame requires exactly one non-blank native `X-Player-Token` header. The token must authenticate the destination Room and Player, and the Player's STOMP session must still be the current presence owner when delivery leaves the broker. The authorization header is removed after validation. A stale or superseded socket cannot receive a new private role delivery.

The start payload contains exactly:

```json
{
  "gameId": "game-001",
  "playerName": "Kien",
  "roleId": "werewolf"
}
```

`gameId` and `playerName` are non-blank strings. `roleId` is limited to the canonical `RoleId` allowlist shared with the frontend character catalog. The frontend rejects malformed JSON, unknown fields, missing or extra fields, and unknown roles.

### Room end delivery

Players subscribe to:

```text
/broadcast/rooms/{roomCode}/end-game
```

The end payload contains exactly:

```json
{
  "gameId": "game-001"
}
```

The frontend accepts only an object with that single non-blank string field. A matching end clears the active in-memory role assignment and returns the Player from `/player/:roomCode/card` to `/player/:roomCode`. A stale end for another game does not clear or navigate away from the current assignment.

### Replay, duplicates, and direction

After a valid Player reconnect completes, Room Service replays that Player's active private start assignment, if one exists. If the Room has ended its latest game, it replays the latest end event. An unassigned Player in an active game receives no private start replay. Replay publication failure does not fail the already valid lobby connection.

Identical accepted starts and repeated accepted ends are idempotent and are published only once by their internal API transitions. Client reducer handling also ignores duplicate starts and matching duplicate ends safely.

Clients may only `SUBSCRIBE` to broadcast destinations. A client `SEND` to a private start destination or the Room end destination is denied. TTT-75 adds no public error destination or queue; private-subscription denial uses the existing STOMP error handling boundary without publishing role or credential details.

## Forbidden changes

- Do not add, rename, version, or replace endpoints or destinations without an approved contract change.
- Do not copy legacy chat destinations into the target contract.
- Distribution role selection, Host Start Game orchestration, Gateway proxying, heartbeat, and restart recovery remain outside TTT-75.

## TTT-125 canonical lobby snapshot and Host bootstrap

The existing `/app/rooms/{roomCode}/connect` destination accepts exactly one of two authenticated payloads:

- Player bootstrap: `{"playerId":"...","playerToken":"..."}`
- Host bootstrap: `{"hostId":"..."}`

Clients subscribe to `/broadcast/rooms/{roomCode}/players` before publishing the bootstrap message. Every successful initial connection and reconnect publishes the persisted Room snapshot. Player bootstrap additionally restores presence and replays only that Player's private game event. Host bootstrap validates the stored Host credential and never creates Player presence.

The canonical snapshot is:

```json
{
  "roomCode": "A7K9Q2",
  "status": "WAITING",
  "currentPlayers": 2,
  "maxPlayers": 6,
  "players": [
    {
      "playerId": "P001",
      "playerName": "Trung",
      "isConnected": true,
      "ready": false
    }
  ]
}
```

`status` is the persisted Room lifecycle (`WAITING` or `PLAYING`). The snapshot contains no Host credential, Player credential, role assignment, internal token, or backend-only field. It is published after join/bootstrap, Ready changes, disconnect and grace removal, maxPlayers changes, Start, and End.
