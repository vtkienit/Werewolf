# Ma Sói Online Redis Schema Contract

## TTT-57 approved player authentication and presence

`player:auth:{roomCode}:{playerId}` stores the unpadded Base64URL SHA-256 digest of the one-time Join token; plaintext is never stored. `presence:room:{roomCode}:player:{playerId}` stores the current STOMP session ID. `presence:session:{stompSessionId}` stores only JSON with `roomCode` and `playerId`. Presence is outside Room JSON and does not alter membership or slots. TTL, heartbeat, and crash cleanup are deferred to TTT-166.

TTT-66 keeps Room membership and the exact authentication key during the 10-second disconnect grace period. Reconnect replaces current presence ownership without changing Room JSON. On owner-checked expiry, Player removal mutates `room:{roomCode}` under `lock:room:{roomCode}` while preserving remaining Player order and compatible unknown fields; only after successful Room removal is `player:auth:{roomCode}:{playerId}` deleted. No pending-removal, scheduler, timeout, TTL, or heartbeat key is stored in Redis. Pending ownership is in memory only, and restart/crash recovery remains TTT-166.

## TTT-75 game lifecycle persistence boundary

TTT-75 adds no game lifecycle Redis key and does not store role assignments or `gameId` in `room:{roomCode}`. Its lifecycle registry, active assignments, ended-game history, and replay source are process memory only. No TTL, durable role storage, or restart recovery is added. This state is lost when Room Service restarts; restart and crash recovery remain deferred to TTT-166.

TTT-24 Create Room contract: LOCKED
TTT-32 maxPlayers contract: LOCKED
Other owner-specific sections: pending their respective reviews

## Source of truth

1. Locked project decisions approved by the team.
2. This reviewed shared contract.
3. Current implementation only as evidence.
4. Legacy relational models are not authoritative.

## Architecture boundary

- Runtime storage is shared Redis only.
- Relational databases and MongoDB are forbidden.
- Round Note is stored only by the frontend in localStorage. It is excluded from Redis and has no backend API.
- TTT-11 documents schemas and namespaces only; it does not implement connectivity, serialization, repositories, TTL, cleanup, locks, or atomic mutations.

## Room record

Key:

```text
room:{roomCode}
```

Value:

```json
{
  "roomCode": "A7K9Q2",
  "hostId": "mP5cYgYNGxa2-WPNnTMR1Q",
  "maxPlayers": 6,
  "players": []
}
```

No additional Room fields are defined.

Create Room identifiers are locked as follows:

- `roomCode` contains exactly six characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- `hostId` is 16 random bytes encoded as unpadded Base64URL.

TTT-24 creates this record as explicit plain JSON using atomic `SET NX` on the
exact key. It retries a key collision at most five times; a Redis or
serialization failure is not a collision. Creation does not overwrite, set a
TTL, or acquire a Room lock. The reserved `lock:room:{roomCode}` namespace is
not used during Create Room.

## Player object

```json
{
  "playerId": "P001",
  "playerName": "Kien",
  "roleId": null
}
```

No additional Player fields are defined.

## Room lock namespace

```text
lock:room:{roomCode}
```

## Update Max Players lock policy (TTT-32 locked)

The `maxPlayers` update acquires a Room lock before any Redis Room read or write.
The lock is acquired with a single atomic `SET NX PX`:

```text
SET lock:room:{roomCode} <ownerToken> NX PX <leaseMs>
```

Configuration:

| Setting | Value | Environment variable |
| --- | --- | --- |
| Acquisition timeout | 2s | `ROOM_LOCK_ACQUISITION_TIMEOUT` |
| Lease duration | 10s | `ROOM_LOCK_LEASE_DURATION` |
| Retry interval | 50ms | `ROOM_LOCK_RETRY_INTERVAL` |

The `<ownerToken>` is 16 `SecureRandom` bytes encoded as unpadded Base64URL and
is unique per lock acquisition operation. There is no `EXISTS` before `SET`, no
synchronized JVM lock, no infinite wait, and no infinite lease. The `hostId`
never appears in the lock key or value, and the owner token is never logged.
The thread interrupt flag is restored if the retry sleep is interrupted. A lock
acquisition timeout maps to `ROOM_UPDATE_BUSY`.

Release uses one atomic Lua compare-and-delete executed from `finally`:

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
```

Release never issues an unconditional `DEL` and never deletes a successor
owner's lock; a zero result means the caller is not the owner or the lease
already expired. There is no automatic lease renewal in TTT-32. A release
failure must not rewrite or roll back an already committed Room update. Release
failures are logged without `hostId`, token, or Room JSON. Eventual cleanup of
an expired or abandoned lock relies on the finite lease.

## Update Max Players mutation (TTT-32 locked)

TTT-32 changes only `maxPlayers` on the stored Room. The mutation performs a
single read-check-write inside one lock:

1. Acquire `lock:room:{roomCode}`.
2. Read the raw Room JSON by exact key `room:{roomCode}`.
3. Distinguish Room not found from Redis failure.
4. Validate the stored Room root is an object with exactly the four locked
   top-level fields `roomCode`, `hostId`, `maxPlayers`, and `players`, and that
   `players` is an array.
5. Compare `X-Host-Id` with the stored `hostId`.
6. Count the raw `players` array and reject values below the Player count.
7. On a same-value update, return the current `maxPlayers` without a Redis Room
   write.
8. Otherwise replace only the `maxPlayers` node, serialize, and write the
   updated JSON with a Redis `SET` that atomically replaces the value at the key
   level. If serialization fails, Redis is not called.
9. Release the lock safely in `finally`.

The stored Room JSON remains exactly four top-level fields:

```json
{
  "roomCode": "A7K9Q2",
  "hostId": "mP5cYgYNGxa2-WPNnTMR1Q",
  "maxPlayers": 6,
  "players": []
}
```

TTT-32 preserves `roomCode`, `hostId`, every Player object, every unknown
Player field, nested Player content, `null` values inside Player objects, and
Player ordering. It does not add `status`, timestamps, `version`,
`roleConfig`, lock metadata, or Java type metadata, and it does not create a
Trung-owned Player class. Jackson object-tree processing is used for the stored
Room so Player nodes are preserved as raw JSON. Malformed stored Room data maps
to `INTERNAL_ERROR`. No TTL is set on the Room key and no lock metadata is
written into the Room value.

Update Max Players, Player Join, controlled Player removal after disconnect
grace, Start Game, and End Game all acquire `lock:room:{roomCode}` before their
Room read/check/mutation or lifecycle publication boundary. Same-Room mutations
therefore share one serialization boundary while different Rooms remain
independent.

## Mutation ownership

| Mutation | Owner |
|---|---|
| Update maxPlayers | Trung |
| Player join | Kiên |
| Player removal | Kiên |
| Start Game | Thứ |
| End Game | Thứ |

All listed mutations use the same Room lock. TTT-164 owns this shared locking boundary.

## Shared runtime conventions for later Jira stories

- Redis host environment name: `REDIS_HOST`
- Redis port environment name: `REDIS_PORT`

These names are documented for later wiring; TTT-11 does not add Redis configuration.

## Forbidden changes

- Do not add fields to the locked Room or Player objects without team approval.
- Do not introduce another database.
- Do not implement TTL, cleanup, or a different lock namespace in TTT-11.

## Deferred decisions

- TTL and cleanup behavior remain outside TTT-24; Create Room sets no TTL.

## TTT-125 backward-compatible fields

TTT-125 adds `ready` to each persisted Player and uses the existing persisted `lifecycle` and `gameId` fields owned by the Start/End flow. Older Player objects without `ready` are read as `false` and receive an explicit boolean on their next authoritative mutation. Ready is reset to `false` for all Players on successful End Game.

```json
{
  "playerId": "P001",
  "playerName": "Trung",
  "roleId": null,
  "ready": false
}
```

Duplicate display names are allowed. `playerId` remains the only persisted Player identity used for authentication, Ready state, role lookup, and frontend Round Note identity.

## Review status

- Trung: TTT-24 Create Room record and creation rules — locked.
- Trung: TTT-32 Update Max Players lock policy and mutation — locked.
- Kiên: Player and player-mutation sections — pending review.
- Thứ: game-mutation sections — pending review.
