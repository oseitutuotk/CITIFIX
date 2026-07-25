// getDeviceId — returns a persistent unique ID for this browser/device.
// Used to link guest reports to an account if the user later signs up.
// Stored in localStorage so it survives page refreshes.

export function getDeviceId() {
  const key = 'citifix_device_id'
  let deviceId = localStorage.getItem(key)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(key, deviceId)
  }

  return deviceId
}
