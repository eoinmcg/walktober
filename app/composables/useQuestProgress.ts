export const useQuestProgress = () => {
  const STORAGE_KEY = 'walktober_progress'

  // Retrieve all completed quests
  const getCompletedQuests = (): Record<string, { completedAt: string; imageKey: string }> => {
    if (import.meta.server) return {}
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  }

  // Check if a specific quest is done
  const isQuestCompleted = (questId: string): boolean => {
    const progress = getCompletedQuests()
    return progress[questId] || false
  }

  // Store a completed quest (linking it to the IndexedDB id)
  const completeQuest = (questId: string, imageId: string) => {
    if (import.meta.server) return
    const progress = getCompletedQuests()

    progress[questId] = {
      completedAt: new Date().toISOString(),
      imageId
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }

  // Remove a specific quest (if a user wants to retake/delete it)
  const removeQuest = (questId: string) => {
    if (import.meta.server) return
    const progress = getCompletedQuests()

    if (progress[questId]) {
      delete progress[questId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }

  // Reset all progress (e.g., for a "New Game" button)
  const resetProgress = () => {
    if (import.meta.server) return
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    getCompletedQuests,
    isQuestCompleted,
    completeQuest,
    removeQuest,
    resetProgress
  }
}
