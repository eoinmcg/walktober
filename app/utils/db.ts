const DB_NAME = 'scrapbook'
const DB_VERSION = 1

const IMAGE_STORE = 'images'

let dbPromise: Promise<IDBDatabase> | null = null

export type ImageRecord = {
  id: string
  blob: Blob
  createdAt: number
  label?: string
  description?: string
  tags: string[]
  type: string
}

export function initDB(): Promise<IDBDatabase> {
  if (!import.meta.client) {
    return Promise.reject(
      new Error('IndexedDB is only available in the browser'),
    )
  }
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, {
          keyPath: 'id',
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })

  return dbPromise
}

export async function saveImage(
  blob: Blob,
  metadata: Omit<ImageRecord, 'id' | 'blob' | 'createdAt'> = {},
): Promise<ImageRecord> {
  const db = await initDB()

  const image: ImageRecord = {
    id: crypto.randomUUID(),
    blob,
    ...metadata,
    createdAt: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readwrite')
    const store = transaction.objectStore(IMAGE_STORE)

    store.put(image)

    transaction.oncomplete = () => resolve(image)
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function updateImage(
  id: string,
  updates: Partial<Omit<ImageRecord, 'id'>>,
): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readwrite')
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.get(id)

    request.onsuccess = () => {
      const existing = request.result as ImageRecord | undefined

      if (!existing) {
        reject(new Error(`Image not found: ${id}`))
        return
      }

      store.put({
        ...existing,
        ...updates,
      })
    }

    request.onerror = () => {
      reject(request.error)
    }

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

export async function getAllImages(): Promise<ImageRecord[]> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readonly')
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export async function getImage(id: string): Promise<ImageRecord> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readonly')
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export async function deleteImage(
  id: string,
): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readwrite')
    const store = transaction.objectStore(IMAGE_STORE)

    store.delete(id)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}
