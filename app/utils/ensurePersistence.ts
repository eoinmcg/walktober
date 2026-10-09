export default async function ensurePersistence() {
  // Safari / iOS is strict, so we actively request it there
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted()
    if (!isPersisted) {
      await navigator.storage.persist()
    }
  }
}

