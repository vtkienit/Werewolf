import { useEffect, useState } from "react"
import { ArrowLeft, LockKeyhole } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import EndGameButton from "../../game-setup/components/EndGameButton"
import { useHostRoomRoute } from "../../host-room/pages/HostRoomPage"
import { beginGameReviewSession, confirmCurrentRound, loadActiveGameReview, loadLatestCompletedGameReview, updatePlayerRoundNote } from "../storage/roundNoteStorage"
import type { GameReview } from "../storage/roundNoteStorage"
import { characters } from "../../../data/characters"
import { RoleArtwork } from "../../roles/roleArtwork"
import { useLanguage } from "../../../contexts/LanguageProvider"
import { localizedCharacterScript } from "../../../data/characterEnglishCopy"

function roleDisplayName(roleName: string, lang: "vi" | "en") {
  const character = characters.find(candidate => candidate.nameEn === roleName || candidate.name === roleName)
  return character ? (lang === "en" ? character.nameEn || character.name : character.name) : roleName
}

function RoundHistory({ review }: { review: GameReview }) {
  const { lang, translate } = useLanguage()
  if (review.rounds.length === 0) return <p className="rounded-2xl border border-dashed border-[var(--ww-border-strong)] p-5 text-sm text-[var(--ww-text-3)]">{translate("Các vòng đã xác nhận sẽ xuất hiện tại đây.", "Confirmed rounds will appear here.")}</p>
  return <div className="space-y-3">{review.rounds.map(round => <details className="rounded-2xl border border-[var(--ww-border)] bg-[var(--ww-surface-2)] p-4" key={round.roundNumber}><summary className="cursor-pointer font-bold text-[var(--ww-text)]">{translate("Vòng đã xác nhận", "Confirmed round")} {round.roundNumber}</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{round.playerNotes.map(note => <div className="ww-inset-surface rounded-xl p-3" key={note.playerId}><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-[var(--ww-text)]">{roleDisplayName(note.roleNameSnapshot, lang)} - {note.playerNameSnapshot}</p>{note.playerDisambiguator && <span className="ww-badge ww-badge-muted text-[10px]">{note.playerDisambiguator}</span>}</div><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ww-text-2)]">{note.text || translate("Không có ghi chú.", "No note.")}</p></div>)}</div></details>)}</div>
}

function ReadOnlyReview({ review, roomCode }: { review: GameReview; roomCode: string }) {
  const { translate } = useLanguage()
  return <section className="ww-card p-5 sm:p-7" aria-labelledby="review-heading"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]">{translate("Đã lưu trên thiết bị", "Archived locally")}</p><h1 id="review-heading" className="ww-display mt-1 text-3xl text-[var(--ww-text)]">{translate("Xem lại ván trước", "Previous game review")}</h1><p className="mt-2 text-[var(--ww-gold)]">{translate("Phe chiến thắng", "Winner")}: {review.winningSide ?? translate("Chưa ghi nhận", "Not recorded")}</p></div><Link className="ww-button ww-button-secondary" to={routePaths.hostRoom(roomCode)}><ArrowLeft aria-hidden="true" size={17} /> {translate("Quay lại phòng Host", "Back to Host room")}</Link></div><div className="mt-7"><RoundHistory review={review} /></div></section>
}

const factionDisplayNames: Record<string, string> = {
  village: "Dân làng",
  werewolf: "Sói",
  vampire: "Ma cà rồng",
  other: "Khác",
}

export default function RoundNotePage() {
  const { lang, translate } = useLanguage()
  const navigate = useNavigate()
  const { roomCode, game } = useHostRoomRoute()
  const [session, setSession] = useState<GameReview | null>(() => loadActiveGameReview(roomCode).session)
  const [storageMessage, setStorageMessage] = useState(() => translate("Đã lưu trên thiết bị này.", "Saved locally on this device."))

  useEffect(() => {
    if (!session && game.active && game.gameSessionId && game.assignments.length > 0) {
      setSession(beginGameReviewSession(roomCode, game.gameSessionId, game.assignments))
    }
  }, [session, game.active, game.gameSessionId, game.assignments, roomCode])

  if (!game.active) {
    const review = loadLatestCompletedGameReview(roomCode)
    return review ? <ReadOnlyReview review={review} roomCode={roomCode} /> : (
      <section className="ww-card p-6">
        <p className="text-[var(--ww-text-2)]">{translate("Không có ván đã hoàn thành để xem lại.", "No completed game is available to review.")}</p>
        <Link className="ww-button ww-button-secondary mt-4" to={routePaths.hostRoom(roomCode)}>{translate("Quay lại phòng Host", "Back to Host room")}</Link>
      </section>
    )
  }

  function update(playerId: string, text: string) {
    if (!session) return
    const updated = updatePlayerRoundNote(roomCode, session.gameSessionId, playerId, text)
    if (updated) {
      setSession(updated)
      setStorageMessage(translate("Đã lưu trên thiết bị này.", "Saved locally on this device."))
    } else {
      setStorageMessage(translate("Không thể lưu ghi chú vòng.", "Round Note storage is unavailable."))
    }
  }

  function confirm() {
    if (!session) return
    const updated = confirmCurrentRound(roomCode, session.gameSessionId)
    if (updated) {
      setSession(updated)
      setStorageMessage(translate("Đã xác nhận vòng. Có thể nhập ghi chú cho vòng mới.", "Round confirmed. New inputs are ready."))
    } else {
      setStorageMessage(translate("Không thể lưu ghi chú vòng.", "Round Note storage is unavailable."))
    }
  }

  async function endGame() {
    if (await game.end()) navigate(routePaths.hostRoom(roomCode), { replace: true })
  }

  const orderedPlayerNotes = session
    ? session.currentRound.playerNotes
        .map((note, assignmentIndex) => ({
          note,
          assignmentIndex,
          character: characters.find(character => character.id === note.roleId || character.nameEn === note.roleNameSnapshot || character.name === note.roleNameSnapshot),
        }))
        .sort((a, b) => {
          const aOrder = a.character?.wakesAtNight ? (a.character.nightOrder ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER
          const bOrder = b.character?.wakesAtNight ? (b.character.nightOrder ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER
          return aOrder - bOrder || a.assignmentIndex - b.assignmentIndex
        })
    : []

  return (
    <div className="space-y-6">
      {/* Top Header Card matching Screenshot 4 */}
      <section className="ww-card overflow-hidden" aria-labelledby="night-guide-title">
        <div className="ww-night-guide p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--ww-primary)]">
            {translate("CỐT TRUYỆN LÀNG", "VILLAGE STORY")}
          </p>
          <h2 id="night-guide-title" className="ww-display mt-1 text-2xl text-[var(--ww-text)]">
            {translate("Làng Hoa Trắng Bên Mộ", "The Village of White Grave Flowers")}
          </h2>
          <div className="mt-3 w-full text-xs sm:text-sm leading-relaxed text-[var(--ww-text-2)] space-y-3 font-normal opacity-90">
            <p>
              {translate("Phía sau Làng Hoa Trắng là nghĩa địa cổ, nơi loài hoa không tên mọc quanh năm trên những nấm mộ không bia. Người làng tin hoa chỉ nở khi người chết còn điều chưa nói, và chỉ chuyển đỏ khi kẻ giết người vẫn đang giữa đám tang.", "Behind the Village of White Flowers lies an ancient cemetery where nameless blossoms grow year-round over unmarked graves. Villagers believe they bloom when the dead still have something left unsaid, and turn red only when the killer remains among the mourners.")}
            </p>
            <p>
              {translate("Sáng nay, nghĩa địa trắng xóa như phủ tuyết. Trên mỗi nấm mộ mới nở một bông hoa có nhụy đỏ, số bông đúng bằng 15 người đang có mặt trong nhà thờ bỏ hoang. Dưới chân bàn thờ, cha xứ để lại lá thư: \"Sói đã học cách quỷ quyệt như người. Đừng tìm chúng ngoài rừng nữa.\"", "This morning, the cemetery was white as snow. Each grave bore a new red-hearted flower, exactly matching the 15 people gathered in the abandoned church. At the altar, the priest left a letter: \"The wolves have learned human cunning. Stop searching for them in the forest.\"")}
            </p>
            <p>
              {translate("Cha xứ từng là người giữ bản phả hệ của làng. Trong thư, ông viết rằng mỗi dòng họ được giao một bổn phận để canh giữ nghĩa địa: nhà tiên kiến nhìn thấy linh hồn bị thú tính che phủ, nhà canh mộ biết đóng cửa từ trong một đêm, nhà bào chế giữ thuốc hồi sinh và thuốc độc, nhà thợ săn truyền nhau viên đạn bạc, nhà tình nhân giữ lời thề rằng một cái chết có thể kéo theo một cái chết khác.", "The priest once kept the village genealogy. He wrote that each bloodline carried a duty: seers could glimpse souls hidden by bestial nature, gravekeepers could seal a door for one night, alchemists guarded healing draughts and poison, hunters passed down a silver bullet, and lovers swore that one death could summon another.")}
            </p>
            <p>
              {translate("Những chức phận ấy tồn tại vì sói không chỉ giết người; chúng phá ký ức của làng. Khi một người bị cắn, sáng hôm sau mọi bằng chứng bắt đầu mục nát, nhân chứng nghi ngờ chính mắt mình, và người chết chỉ còn nói qua hoa trắng. Vì vậy dân làng phải xử tử khi mặt trời còn đủ cao, trước khi đêm xuống và sự thật bị chôn thêm một lớp đất.", "Those duties exist because wolves do more than kill; they erode the village's memory. After a bite, evidence decays, witnesses doubt their own eyes, and the dead speak only through white flowers. The village must pass judgment before night buries the truth beneath another layer of earth.")}
            </p>
            <p className="font-medium text-[var(--ww-faction-night)]">
              {translate("Hương hoa ngọt đến nghẹt thở. Các bạn nhận chức phận, và nghĩa địa bắt đầu chờ kẻ kế tiếp.", "The flowers smell sweet enough to suffocate. You accept your duties, and the cemetery begins waiting for its next arrival.")}
            </p>
            <p className="text-[var(--ww-text-3)] text-xs italic">
              {translate("Đọc to cho cả bàn nghe trước khi chia vai, như mở đầu một phiên DnD.", "Read this aloud before assigning roles, like the opening of a tabletop session.")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* Left column: Player notes cards */}
        <section className="ww-card p-5 sm:p-7" aria-labelledby="round-note-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]">{translate("Không gian riêng của Host", "Private Host workspace")}</p>
              <h1 id="round-note-heading" className="ww-display mt-1 text-3xl text-[var(--ww-text)]" aria-label={`${translate("Vòng", "Round")} ${session?.currentRound.roundNumber ?? 1}`}>
                {translate("Vòng", "Round")}: {session?.currentRound.roundNumber ?? 1}
              </h1>
            </div>
          </div>

          {!session ? (
            <div className="ww-alert-warning mt-5 rounded-2xl p-4" role="status">
              {translate("Đang khôi phục phiên game riêng tư.", "Restoring the private game session.")}
            </div>
          ) : (
            <>
              <div className="ww-round-note-list mt-6">
                {orderedPlayerNotes.map(({ note, character: char }, index) => {
                  const displayRoleName = char ? (lang === "en" ? char.nameEn || char.name : char.name) : note.roleNameSnapshot
                  const roleScript = char ? localizedCharacterScript(char, lang) : ""

                  const teamColor = char?.team === "werewolf"
                    ? "border-[var(--ww-faction-werewolf)] bg-[var(--ww-faction-werewolf-bg)] text-[var(--ww-faction-werewolf)]"
                    : char?.team === "village"
                    ? "border-[var(--ww-faction-village)] bg-[var(--ww-faction-village-bg)] text-[var(--ww-faction-village)]"
                    : "border-[var(--ww-faction-other)] bg-[var(--ww-faction-other-bg)] text-[var(--ww-faction-other)]"

                  const teamNameVi = char?.team === "werewolf"
                    ? translate("Sói", "Werewolves")
                    : char?.team === "village"
                    ? translate("Dân làng", "Village")
                    : char?.team === "vampire"
                    ? translate("Ma cà rồng", "Vampires")
                    : translate("Khác", "Other")

                  const phaseLabel = char?.wakesAtNight
                    ? char.phase === "every"
                      ? translate("Mỗi đêm", "Every night")
                      : translate("Chỉ đêm 1", "First night only")
                    : ""

                  return (
                    <article className="ww-note-entry ww-round-note-row rounded-2xl border border-[var(--ww-border)] p-4" data-testid="round-note-entry" key={note.playerId}>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          {char ? <RoleArtwork roleId={char.id} roleName={char.name} className="h-10 w-10 shrink-0 rounded-lg" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500 text-xs font-black text-white">{index + 1}</span>}
                          <div className="min-w-0">
                            <label className="block text-sm font-bold text-[var(--ww-text)]" htmlFor={`note-${note.playerId}`}>
                              <span>{displayRoleName} - {note.playerNameSnapshot}</span>
                              {note.playerDisambiguator && <span className="ww-badge ww-badge-muted ml-2 align-middle text-[9px]">{note.playerDisambiguator}</span>}
                            </label>

                            {/* Badges row */}
                            <div className="flex gap-1.5 mt-1">
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${teamColor}`}>
                                {teamNameVi}
                              </span>
                              {phaseLabel && (
                                <span className="rounded-full border border-[var(--ww-border-strong)] bg-[var(--ww-faction-night-bg)] px-2 py-0.5 text-[9px] font-bold text-[var(--ww-faction-night)]">
                                  {phaseLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Character script prompt in italic text matching Screenshot 4 */}
                        {roleScript && (
                          <p className="mt-2 text-xs italic text-[var(--ww-text-3)] leading-relaxed">
                            "{roleScript}"
                          </p>
                        )}
                      </div>

                      <div className="ww-round-note-row__input">
                        <span className="text-[10px] font-bold text-[var(--ww-text-3)] uppercase tracking-wider block mb-1">
                          {translate("GHI CHÚ", "NOTE")}
                        </span>
                        <textarea
                          id={`note-${note.playerId}`}
                          className="ww-input min-h-[5rem] resize-y p-2.5 text-sm"
                          value={note.text}
                          onChange={event => update(note.playerId, event.target.value)}
                          placeholder={translate("Nhập ghi chú", "Enter note")}
                        />
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="ww-divider mt-6 flex justify-end border-t pt-5">
                <button
                  type="button"
                  aria-label={`${translate("Xác nhận vòng", "Confirm round")} ${session.currentRound.roundNumber}`}
                  className="ww-button ww-button-cta ww-button-primary sm:w-auto"
                  onClick={confirm}
                >
                  {translate("Xác nhận", "Confirm")}
                </button>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-[var(--ww-text-3)]" role="status">
                <LockKeyhole aria-hidden="true" size={12} />
                {storageMessage}
              </p>

              <div className="mt-8">
                <h2 className="ww-display mb-4 text-2xl text-[var(--ww-text)]">{translate("Lịch sử vòng", "Round history")}</h2>
                <RoundHistory review={session} />
              </div>
            </>
          )}
        </section>

        {/* Right sidebar: Winning Faction selection and end game action */}
        <aside className="ww-card space-y-5 p-5 xl:sticky xl:top-6">
          {/* Visual Faction Selection Buttons Row matching Screenshot 4 */}
          <div className="space-y-3">
            <label className="font-bold text-[var(--ww-text)] text-sm" htmlFor="winning-side-visual">
              {translate("Phe thắng", "Winning faction")}
            </label>

            {/* Hidden select dropdown for testing compatibility */}
            <select
              id="winning-side"
              className="sr-only"
              value={game.winningSide}
              disabled={game.pending}
              onChange={event => game.setWinningSide(event.target.value)}
            >
              <option value="">{translate("Chọn phe chiến thắng", "Select winner")}</option>
              {game.winnerOptions.map(side => (
                <option key={side} value={side}>
                  {side}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2" id="winning-side-visual">
              {game.winnerOptions.map(side => {
                const isSelected = game.winningSide === side
                return (
                  <button
                    type="button"
                    key={side}
                    onClick={() => game.setWinningSide(side)}
                    className={`ww-button ww-button-compact border transition-all ${
                      isSelected
                        ? "bg-[var(--ww-crimson)] text-white border-[var(--ww-crimson)]"
                        : "bg-[var(--ww-surface-2)] text-[var(--ww-text-2)] border-transparent hover:bg-[var(--ww-surface-3)]"
                    }`}
                    disabled={game.pending}
                  >
                    {side === "VILLAGE" ? translate("Dân làng", "Village") : side === "WEREWOLF" ? translate("Sói", "Werewolves") : side === "VAMPIRE" ? translate("Ma cà rồng", "Vampires") : factionDisplayNames[side] ?? side}
                  </button>
                )
              })}
            </div>
          </div>

          {game.statusMessage && (
            <p
              role={game.status === "END_ERROR" ? "alert" : "status"}
              className="rounded-xl border border-[var(--ww-border)] p-3 text-sm text-[var(--ww-text-2)]"
            >
              {game.statusMessage}
            </p>
          )}

          <EndGameButton
            disabled={!game.winningSide || game.pending}
            pending={game.status === "END_REQUEST_PENDING"}
            retry={game.status === "END_ERROR"}
            onClick={() => void endGame()}
          />
        </aside>
      </div>
    </div>
  )
}
