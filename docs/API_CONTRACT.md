# Ma Sói Online REST API Contract

## TTT-57 approved Player Join extension

The existing successful Join response is exactly `{"playerId":"...","playerName":"...","playerToken":"..."}`. `playerToken` is an opaque secret, returned only from successful Join, never logged, placed in a URL, broadcast, or stored in Room JSON. Socket authentication failures expose only the generic `SOCKET_AUTH_FAILED` behavior.

TTT-24 Create Room contract: LOCKED
TTT-32 maxPlayers contract: LOCKED
Other owner-specific sections: pending their respective reviews

## Source of truth

1. Locked project decisions approved by the team.
2. This reviewed shared contract.
3. Current implementation only as evidence.
4. Legacy chat code and documents are not authoritative.

## Ownership

- Trung owns the Room Service room boundary and maintains this draft as integration gatekeeper.
- Kiên owns Player Join and must review the Player endpoint section.
- Thứ owns Distribution, Start Game, and End Game and must review the Distribution sections.
- Contract changes require review from every affected owner.

## Locked endpoints

### Room Service

- `POST /api/rooms`
- `PATCH /api/rooms/{roomCode}/max-players`
- `POST /api/rooms/{roomCode}/players`

### Distribution Service

- `POST /api/distribution/rooms/{roomCode}`
- `POST /api/distribution/rooms/{roomCode}/end-game`

## Create Room (TTT-24 locked)

`POST /api/rooms` accepts no request body and returns `201 Created` with
`Content-Type: application/json`.

```json
{
  "roomCode": "A7K9Q2",
  "hostId": "mP5cYgYNGxa2-WPNnTMR1Q",
  "qrUrl": "http://localhost/join/A7K9Q2"
}
```

`qrUrl` is an absolute public frontend URL targeting `/join/{roomCode}`. The
Player Join route is implemented by Kien; scanning the URL opens that route
with the room code already present, and no QR image is returned by this API.

Errors contain exactly `code` and `message`:

| Scenario | HTTP | Code |
| --- | ---: | --- |
| Non-empty request body | 400 | `INVALID_CREATE_ROOM_REQUEST` |
| Five room-code collisions | 503 | `ROOM_CODE_GENERATION_EXHAUSTED` |
| Redis unavailable or failed | 503 | `ROOM_STORAGE_UNAVAILABLE` |
| Serialization or unexpected failure | 500 | `INTERNAL_ERROR` |

## Update Max Players (TTT-32 locked)

`PATCH /api/rooms/{roomCode}/max-players` updates only the `maxPlayers` field of
an existing Room. The `{roomCode}` path segment must be exactly six characters
from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`; lowercase, ambiguous characters, and
other lengths are rejected without normalization.

### Credential

Authorization is performed at the application layer using a raw host identifier
supplied in the `X-Host-Id` request header. The header value is compared with
the `hostId` stored on the Room. The credential is never placed in the URL,
query string, logs, error messages, lock key, or lock value.

### Request

`Content-Type: application/json`. The body is required and contains exactly:

```json
{
  "maxPlayers": 9
}
```

`maxPlayers` must be a single JSON integer. Missing body, empty body, malformed
JSON, a missing `maxPlayers` field, unknown fields, `null`, strings, decimals,
booleans, arrays, object values, and integers outside the Java `int` range are
rejected. The request is parsed with a TTT-32-scoped strict strategy; no
permissive numeric or string coercion is applied and the global `ObjectMapper`
is not modified to enforce this request.

### Success

`200 OK` with `Content-Type: application/json`. The response contains exactly:

```json
{
  "maxPlayers": 9
}
```

The response never includes `hostId`, `roomCode`, `players`, the full Room,
`status`, timestamps, a response envelope, or lock details.

### Business rules

Valid `maxPlayers` values are `6` through `12` inclusive. The host is not a
Player. An update is rejected when the new value is below the current Player
count. Equal-to-Player-count updates succeed. A same-value update (the new
value equals the current `maxPlayers`) returns `200` with the current
`maxPlayers` and performs no Redis Room write; Room existence, the host
credential, and the Player count are still validated under the lock. Every
rejected operation leaves the Redis Room unchanged.

### Errors

Every error response contains exactly `code` and `message`:

| Scenario | HTTP | Code | Message |
| --- | ---: | --- | --- |
| Invalid room code | 400 | `INVALID_ROOM_CODE` | Room code is invalid |
| Invalid body or request shape | 400 | `INVALID_UPDATE_MAX_PLAYERS_REQUEST` | Update max players request is invalid |
| Outside 6–12 | 400 | `MAX_PLAYERS_OUT_OF_RANGE` | maxPlayers must be between 6 and 12 |
| Missing/blank `X-Host-Id` | 401 | `HOST_CREDENTIAL_REQUIRED` | Host credential is required |
| Incorrect hostId | 403 | `HOST_CREDENTIAL_INVALID` | Host credential is invalid |
| Room missing | 404 | `ROOM_NOT_FOUND` | Room was not found |
| Below current Player count | 409 | `MAX_PLAYERS_BELOW_PLAYER_COUNT` | maxPlayers cannot be lower than the current player count |
| Lock acquisition timeout | 409 | `ROOM_UPDATE_BUSY` | Room is currently being updated |
| Redis read/write failure | 503 | `ROOM_STORAGE_UNAVAILABLE` | Room storage is unavailable |
| Stored JSON, serialization or unexpected failure | 500 | `INTERNAL_ERROR` | Internal server error |

Responses never expose `hostId`, Redis values, the lock owner token, exception
details, or stack traces. Exception handling is scoped to the Room API
controllers owned by Trung; legacy controller handling is not altered.

### Security

Spring Security permits the exact Create Room, Update Max Players, Player Join,
and `/ws` handshake matchers at the framework layer. CSRF is ignored only for
those approved matchers and the two exact internal TTT-75 POST matchers. The
WebSocket handshake under `/ws/**` is permitted; configured WebSocket origins
still apply. The internal matchers require `INTERNAL_REALTIME`, while Create
Room, Update Max Players, Player Join, and `/ws/**` are `permitAll` at the
framework layer and retain their application or STOMP-level validation.
`anyRequest().authenticated()` is retained, so unrelated methods and subpaths
remain protected. Application-level `X-Host-Id` validation provides Update Max
Players authorization; no JWT, Basic, or form login is configured for it.

## TTT-75 internal game-event API

These Room Service endpoints are service-to-service boundaries. They are not routed through the Gateway and are not public Player or Host APIs. Every request requires the environment-configured `X-Internal-Realtime-Token` header. A missing or blank credential returns `401` with `{"code":"INTERNAL_CREDENTIAL_REQUIRED","message":"Internal credential is required"}`; an incorrect credential returns `403` with `{"code":"INTERNAL_CREDENTIAL_INVALID","message":"Internal credential is invalid"}`. The configured credential is not returned or logged.

### Start game for one Player

`POST /internal/realtime/rooms/{roomCode}/players/{playerId}/start-game`

`Content-Type: application/json`. The body contains exactly three non-blank string fields:

```json
{
  "gameId": "game-001",
  "playerName": "Kien",
  "roleId": "werewolf"
}
```

`roomCode` must be canonical, the Room and `playerId` must exist in current Room membership, and `playerName` must exactly match the stored Player name. `roleId` must be one of the canonical values defined by `RoleId`; unknown fields, duplicate fields, missing fields, non-string values, malformed JSON, trailing JSON, and unknown roles are rejected as `INVALID_START_GAME_REQUEST`.

A successful request returns `202 Accepted` with an empty body. The Room Service validates and publishes the supplied assignment but does not select or distribute roles; role-assignment logic remains outside Room Service. It never writes `gameId` or a role assignment to Room JSON.

An identical start for the same Room, active `gameId`, Player, and role is idempotent: it returns `202` and is not published again. A different role for an already assigned Player, a different active game, or a start for an ended `gameId` returns `409 GAME_EVENT_CONFLICT`. A failed publication does not commit lifecycle state, so the request may be retried.

### End game for one Room

`POST /internal/realtime/rooms/{roomCode}/end-game`

`Content-Type: application/json`. The body contains exactly one non-blank string field:

```json
{
  "gameId": "game-001"
}
```

`roomCode` must be canonical and the Room must exist. Unknown fields, duplicate fields, missing fields, non-string values, malformed JSON, and trailing JSON are rejected as `INVALID_END_GAME_REQUEST`.

A successful request returns `202 Accepted` with an empty body. Repeating the most recently accepted end for the same `gameId` is idempotent and is not published again. Ending before a game starts, ending a stale game while another game is active, or otherwise conflicting with the in-memory lifecycle returns `409 GAME_EVENT_CONFLICT`. A failed publication leaves the active lifecycle intact for retry.

### TTT-75 errors

Every error response contains exactly `code` and `message`:

| Scenario | HTTP | Code |
| --- | ---: | --- |
| Missing/blank internal credential | 401 | `INTERNAL_CREDENTIAL_REQUIRED` |
| Incorrect internal credential | 403 | `INTERNAL_CREDENTIAL_INVALID` |
| Invalid Room code | 400 | `INVALID_ROOM_CODE` |
| Invalid start body, including unknown `roleId` | 400 | `INVALID_START_GAME_REQUEST` |
| Invalid end body | 400 | `INVALID_END_GAME_REQUEST` |
| Room missing | 404 | `ROOM_NOT_FOUND` |
| Player missing | 404 | `PLAYER_NOT_FOUND` |
| `playerName` differs from stored membership | 409 | `PLAYER_NAME_MISMATCH` |
| Lifecycle conflict | 409 | `GAME_EVENT_CONFLICT` |
| Shared Room lock cannot be acquired | 409 | `ROOM_UPDATE_BUSY` |
| Room storage unavailable | 503 | `ROOM_STORAGE_UNAVAILABLE` |
| Broker publication fails | 503 | `REALTIME_PUBLICATION_FAILED` |
| Unexpected failure | 500 | `INTERNAL_ERROR` |

## Forbidden changes

- Do not version, rename, or add production endpoints without an approved contract change.
- Do not add GET Room endpoints, DELETE endpoints, or action aliases.
- Do not copy request, response, or error fields from the legacy chat application.

## TTT-125 Host-Player lifecycle contract extensions

These additive extensions complete TTT-125 without changing existing endpoint paths.

### Player Ready mutation

`PATCH /api/rooms/{roomCode}/players/{playerId}/ready`

The request body contains exactly one boolean field, `ready`. The request must include the existing Player credential in `X-Player-Token`. The Room Service validates the credential against the path `roomCode` and `playerId`; Player name is never an authorization or mutation identity. The mutation uses the shared Room lock, is accepted only while the persisted lifecycle is `WAITING`, persists `ready` in the Player object, and publishes the canonical lobby snapshot after a successful mutation. Missing Ready fields in older Room records are interpreted as `false`.

### Start Game response

The existing Start Game response adds `gameSessionId` and `assignments`. `assignments` contains `playerId`, a display-name snapshot, `roleId`, and a role-name snapshot for each current Player. This response is returned only after Host credential validation through the existing Start Game request. It is Host-private application state and must not be copied to the public lobby snapshot, public WebSocket topics, URLs, logs, or Player clients.

### End Game request

The existing End Game request adds required `winningSide`. Valid values are the canonical faction identifiers derived from the approved role catalog. The backend rejects a missing or invalid winner, invalid Host credential, and any End request while the persisted Room lifecycle is not `PLAYING`. A successful End clears roles, resets every Player to `ready=false`, transitions the Room to `WAITING`, publishes the existing End event, and publishes the canonical lobby snapshot.

## Ownership and review status

- Trung: TTT-24 Create Room and TTT-32 Update Max Players sections are locked.
- Kiên: the Player Join contract remains the authoritative Player-owned boundary.
- Thứ: the TTT-75 internal Start Game and End Game contracts above are approved; Distribution Service retains role-assignment ownership, while Room Service validates membership and publishes the supplied events.
- Behavior not documented in an approved section remains outside this contract and must not be inferred.

# TTT-66 disconnect/reconnect compatibility

TTT-66 does not add or change a REST endpoint or response field. The Join response token remains the credential used to reconnect during the 10-second WebSocket grace period. After grace expiry successfully removes the Player from Room membership, that exact Player authentication record is removed and the old Join credential can no longer reconnect. Heartbeat, TTL, crash recovery, and restart cleanup remain outside this API contract and are deferred to TTT-166.
