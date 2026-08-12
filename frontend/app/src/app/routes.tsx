import { BrowserRouter, Route, Routes } from "react-router-dom"
import CreateRoomPage from "../features/host-room/pages/CreateRoomPage"
import ErrorPage from "../features/host-room/pages/ErrorPage"
import HomePage from "../features/host-room/pages/HomePage"
import HostGameSetupPage from "../features/host-room/pages/HostGameSetupPage"
import HostRoomPage from "../features/host-room/pages/HostRoomPage"
import RoundNotePage from "../features/round-note/pages/RoundNotePage"
import JoinPage from "../pages/JoinPage"
import PlayerCardPage from "../pages/PlayerCardPage"
import PlayerRoomPage from "../pages/PlayerRoomPage"
import PlayerWaitingPage from "../pages/PlayerWaitingPage"
import AppLayout from "../layouts/AppLayout"

export default function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/host/create" element={<CreateRoomPage />} />
      <Route path="/host/rooms/:roomCode" element={<HostRoomPage />}>
        <Route path="setup" element={<HostGameSetupPage />} />
        <Route path="round-note" element={<RoundNotePage />} />
      </Route>
      <Route path="/join/:roomCode" element={<JoinPage />} />
      <Route path="/player/:roomCode" element={<PlayerRoomPage />}>
        <Route index element={<PlayerWaitingPage />} />
        <Route path="card" element={<PlayerCardPage />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Route>
  </Routes></BrowserRouter>
}
