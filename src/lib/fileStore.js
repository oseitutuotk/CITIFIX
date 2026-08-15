// Lightweight IndexedDB helper for storing original File objects so uploads
// can be resumed across app restarts.

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('citifix-files', 1)
    req.onupgradeneeded = (evt) => {
      const db = evt.target.result
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function genId() {
  try {
    return self.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
  } catch (e) {
    return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
  }
}

export async function addFiles(files = []) {
  if (!files.length) return []
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite')
    const store = tx.objectStore('files')
    const ids = []
    tx.oncomplete = () => resolve(ids)
    tx.onerror = () => reject(tx.error)
    for (const file of files) {
      const id = genId()
      const rec = {
        id,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        blob: file,
      }
      ids.push(id)
      store.put(rec)
    }
  })
}

export async function getFiles(ids = []) {
  if (!ids.length) return []
  const db = await openDB()
  return Promise.all(ids.map((id) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly')
      const store = tx.objectStore('files')
      const req = store.get(id)
      req.onsuccess = () => {
        const rec = req.result
        if (!rec) return resolve(null)
        const file = new File([rec.blob], rec.name, { type: rec.type, lastModified: rec.lastModified })
        resolve(file)
      }
      req.onerror = () => reject(req.error)
    })
  }))
}

export async function removeFiles(ids = []) {
  if (!ids.length) return
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite')
    const store = tx.objectStore('files')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    for (const id of ids) store.delete(id)
  })
}
