import { Component, type ReactNode } from "react"
import { QRCodeSVG } from "qrcode.react"

type QrErrorBoundaryProps = { children: ReactNode }
type QrErrorBoundaryState = { failed: boolean }

class QrErrorBoundary extends Component<QrErrorBoundaryProps, QrErrorBoundaryState> {
  state: QrErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): QrErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch() {
    // The visible fallback is intentionally generic; renderer details stay private.
  }

  render() {
    if (this.state.failed) {
      return <p className="ww-text-warning text-sm">QR code could not be displayed.</p>
    }
    return this.props.children
  }
}

type RoomQrCodeProps = { joinUrl: string }

export default function RoomQrCode({ joinUrl }: RoomQrCodeProps) {
  return (
    <div className="space-y-3">
      <div className="flex min-h-48 items-center justify-center rounded-2xl bg-white p-4">
        <QrErrorBoundary key={joinUrl}>
          <QRCodeSVG
            value={joinUrl}
            level="M"
            marginSize={4}
            size={208}
            className="h-auto w-full max-w-52"
            aria-label="QR code for joining room"
          />
        </QrErrorBoundary>
      </div>
      <a
        href={joinUrl}
        className="ww-focus block break-all rounded-md text-sm text-[var(--ww-cyan)] underline decoration-[var(--ww-cyan)] underline-offset-4"
      >
        {joinUrl}
      </a>
    </div>
  )
}
