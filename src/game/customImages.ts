const DATABASE_NAME = 'doge-2048'
const STORE_NAME = 'custom-tile-images'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadCustomImages(): Promise<Record<number, Blob>> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .getAll()
    const keysRequest = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .getAllKeys()

    let values: Blob[] | null = null
    let keys: IDBValidKey[] | null = null
    const finish = () => {
      if (!values || !keys) return
      resolve(
        Object.fromEntries(keys.map((key, index) => [Number(key), values![index]])),
      )
      database.close()
    }

    request.onsuccess = () => {
      values = request.result
      finish()
    }
    keysRequest.onsuccess = () => {
      keys = keysRequest.result
      finish()
    }
    request.onerror = () => reject(request.error)
    keysRequest.onerror = () => reject(keysRequest.error)
  })
}

export async function saveCustomImage(value: number, image: Blob): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .put(image, value)
    request.onsuccess = () => {
      database.close()
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

export async function clearCustomImages(): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .clear()
    request.onsuccess = () => {
      database.close()
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}
