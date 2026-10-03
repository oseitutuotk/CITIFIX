import { QRCodeSVG } from 'qrcode.react'

export default function DesktopFrame({ children }) {
  return (
    <div className="desktop-shell">
      <aside className="desktop-note">
        <h2>CitiFix</h2>
        <p>Designed mobile-first. Scan to open on your phone, or explore the preview here.</p>
        <QRCodeSVG value="https://citifix-rho.vercel.app" size={140} />
      </aside>
      <div className="phone">{children}</div>
    </div>
  )
}