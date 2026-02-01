import { openDB } from 'idb'

const DB_NAME = 'productivite-db'
const STORE_NAME = 'tasks'
const DB_VERSION = 2

export const isDbSupported = () => typeof indexedDB !== 'undefined'

const getDb = async () => {
  if (!isDbSupported()) {
    throw new Error('IndexedDB indisponible')
  }

  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Supprime l'ancien store pour repartir a zero
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME)
      }

      // Nouveau store avec schema simplifie
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('category', 'category', { unique: false })
      store.createIndex('completed', 'completed', { unique: false })
    },
  })
}

export const loadTasks = async () => {
  const db = await getDb()
  return db.getAll(STORE_NAME)
}

export const upsertTask = async (task) => {
  const db = await getDb()
  await db.put(STORE_NAME, task)
}

export const deleteTask = async (taskId) => {
  const db = await getDb()
  await db.delete(STORE_NAME, taskId)
}
