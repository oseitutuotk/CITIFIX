// getDeviceId — returns a persistent unique ID for this browser/device.
// Used to link guest reports to an account if the user later signs up.
// Stored in localStorage so it survives page refreshes.

export function getDeviceId() {
  const key = 'citifix_device_id'
  let deviceId = localStorage.getItem(key)

  if (!deviceId) {
    // Prefer native crypto.randomUUID when available, otherwise fall back
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        deviceId = crypto.randomUUID()
      } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        // RFC4122 v4 UUID
        const bytes = new Uint8Array(16)
        crypto.getRandomValues(bytes)
        // Per RFC: set version bits
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
        deviceId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
      } else {
        deviceId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
      }
    } catch (e) {
      deviceId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
    }
    localStorage.setItem(key, deviceId)
  }

  return deviceId
}
