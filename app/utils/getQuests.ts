export default async function getQuests() {
  const embeddings = await (await fetch('/embeddings/text-embeddings.json')).json()
  return embeddings.quests
}
