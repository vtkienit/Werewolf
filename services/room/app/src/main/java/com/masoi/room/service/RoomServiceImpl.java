package com.masoi.room.service;

import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.dto.response.JoinRoomResponse;
import com.masoi.room.exception.HostCredentialInvalidException;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.exception.MaxPlayersOutOfRangeException;
import com.masoi.room.exception.RoomCodeGenerationExhaustedException;
import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.InvalidPlayerNameException;
import com.masoi.room.exception.PlayerIdGenerationExhaustedException;
import com.masoi.room.exception.PlayerCredentialInvalidException;
import com.masoi.room.exception.PlayerNotFoundException;
import com.masoi.room.exception.RoomFullException;
import com.masoi.room.exception.RoomPlayingException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.JoinRoomSerializationException;
import com.masoi.room.exception.JoinRoomNotFoundException;
import com.masoi.room.model.HostCredential;
import com.masoi.room.model.Room;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.model.SaveRoomResult;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.utils.HostIdGenerator;
import com.masoi.room.utils.QrUrlFactory;
import com.masoi.room.utils.RoomCodeGenerator;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.PlayerIdGenerator;
import com.masoi.room.utils.RoomCodeFormat;
import com.masoi.room.model.Player;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import com.masoi.room.repository.PlayerAuthStore;

@Service
public class RoomServiceImpl implements RoomService {
    private static final int MAX_CREATE_ATTEMPTS = 5;
    private static final int MIN_MAX_PLAYERS = 6;
    private static final int MAX_MAX_PLAYERS = 12;

    private final HostIdGenerator hostIdGenerator;
    private final RoomCodeGenerator roomCodeGenerator;
    private final RoomRepository repository;
    private final QrUrlFactory qrUrlFactory;
    private final RoomLock lock;
    private final UpdateMaxPlayersRoomStore store;
    private final PlayerIdGenerator playerIdGenerator;
    private final PlayerAuthStore playerTokenService;

    public RoomServiceImpl(HostIdGenerator hostIdGenerator, RoomCodeGenerator roomCodeGenerator,
                           RoomRepository repository, QrUrlFactory qrUrlFactory, RoomLock lock, UpdateMaxPlayersRoomStore store,
                           PlayerIdGenerator playerIdGenerator, PlayerAuthStore playerTokenService) {
        this.hostIdGenerator = hostIdGenerator;
        this.roomCodeGenerator = roomCodeGenerator;
        this.repository = repository;
        this.qrUrlFactory = qrUrlFactory;
        this.lock = lock;
        this.store = store;
        this.playerIdGenerator = playerIdGenerator;
        this.playerTokenService = playerTokenService;
    }

    @Override
    public CreateRoomResponse createRoom() {
        String hostId = hostIdGenerator.generate();
        for (int attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
            String roomCode = roomCodeGenerator.generate();
            if (repository.saveIfAbsent(Room.create(roomCode, hostId)) == SaveRoomResult.SAVED) {
                return new CreateRoomResponse(roomCode, hostId, qrUrlFactory.create(roomCode));
            }
        }
        throw new RoomCodeGenerationExhaustedException();
    }

    @Override
    public UpdateMaxPlayersResponse updateMaxPlayers(String roomCode, String hostId, int maxPlayers) {
        RoomCodeFormat.requireCanonical(roomCode);
        if (maxPlayers < MIN_MAX_PLAYERS || maxPlayers > MAX_MAX_PLAYERS) {
            throw new MaxPlayersOutOfRangeException();
        }
        String ownerToken = lock.acquireOrThrow(roomCode);
        try {
            RoomSnapshot snapshot = store.read(roomCode);
            if (snapshot == null) {
                throw new RoomNotFoundException();
            }
            if (!HostCredential.matches(hostId, snapshot.hostId())) {
                throw new HostCredentialInvalidException();
            }
            if ("PLAYING".equals(snapshot.root().path("lifecycle").asText("WAITING"))) throw new RoomPlayingException();
            if (maxPlayers < snapshot.playerCount()) {
                throw new MaxPlayersBelowPlayerCountException();
            }
            if (maxPlayers == snapshot.maxPlayers() && snapshot.root().hasNonNull("lifecycle")) {
                return new UpdateMaxPlayersResponse(snapshot.maxPlayers());
            }
            snapshot.root().put("lifecycle", "WAITING");
            snapshot.root().put("maxPlayers", maxPlayers);
            store.write(roomCode, snapshot.root());
            return new UpdateMaxPlayersResponse(maxPlayers);
        } finally {
            lock.release(roomCode, ownerToken);
        }
    }

    @Override
    public JoinRoomResponse joinRoom(String roomCode, JoinRoomRequest request) {
        RoomCodeFormat.requireCanonical(roomCode);
        String playerName = request == null || request.playerName() == null ? null : request.playerName().trim();
        if (playerName == null || playerName.isBlank() || playerName.length() > 30)
            throw new InvalidPlayerNameException();
        String ownerToken = lock.acquireOrThrow(roomCode);
        try {
            RoomSnapshot snapshot;
            try {
                snapshot = repository.read(roomCode);
            } catch (RoomSerializationException exception) {
                throw new JoinRoomSerializationException(exception);
            }
            if (snapshot == null) throw new JoinRoomNotFoundException();
            if ("PLAYING".equals(snapshot.root().path("lifecycle").asText("WAITING"))) throw new RoomPlayingException();
            ArrayNode players = (ArrayNode) snapshot.root().get("players");
            if (players.size() >= snapshot.maxPlayers()) throw new RoomFullException();
            String playerId = uniquePlayerId(players);
            String playerToken = playerTokenService.create(roomCode, playerId);
            ObjectNode player = players.addObject();
            player.put("playerId", playerId);
            player.put("playerName", playerName);
            player.putNull("roleId");
            player.put("ready", false);
            snapshot.root().put("lifecycle", "WAITING");
            try {
                repository.write(roomCode, snapshot.root());
            } catch (RuntimeException exception) {
                try {
                    playerTokenService.delete(roomCode, playerId);
                } catch (RuntimeException cleanupException) {
                    exception.addSuppressed(cleanupException);
                }
                if (exception instanceof RoomSerializationException serialization)
                    throw new JoinRoomSerializationException(serialization);
                throw exception;
            }
            return new JoinRoomResponse(playerId, playerName, playerToken);
        } finally {
            lock.release(roomCode, ownerToken);
        }
    }

    @Override
    public void updateReady(String roomCode, String playerId, String playerToken, boolean ready) {
        RoomCodeFormat.requireCanonical(roomCode);
        String ownerToken = lock.acquireOrThrow(roomCode);
        try {
            RoomSnapshot snapshot = repository.read(roomCode);
            if (snapshot == null) throw new RoomNotFoundException();
            if (playerId == null || playerId.isBlank() || !playerTokenService.matches(roomCode, playerId, playerToken))
                throw new PlayerCredentialInvalidException();
            if ("PLAYING".equals(snapshot.root().path("lifecycle").asText("WAITING"))) throw new RoomPlayingException();
            ObjectNode target = null;
            for (JsonNode player : snapshot.root().withArray("players"))
                if (playerId.equals(player.path("playerId").asText())) target = (ObjectNode) player;
            if (target == null) throw new PlayerNotFoundException();
            target.put("ready", ready);
            snapshot.root().put("lifecycle", "WAITING");
            repository.write(roomCode, snapshot.root());
        } finally {
            lock.release(roomCode, ownerToken);
        }
    }

    private String uniquePlayerId(ArrayNode players) {
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate = playerIdGenerator.generate();
            boolean exists = false;
            for (JsonNode player : players)
                if (candidate.equals(player.path("playerId").asText())) {
                    exists = true;
                    break;
                }
            if (!exists) return candidate;
        }
        throw new PlayerIdGenerationExhaustedException();
    }
}
