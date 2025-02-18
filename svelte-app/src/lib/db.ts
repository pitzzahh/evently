import PocketBase from 'pocketbase'
import type { TypedPocketBase } from "@/types/pb-types"
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_INSTANCE) as TypedPocketBase

export async function getAuth() {
  await pb.collection('_superusers').authWithPassword(import.meta.env.VITE_ADMIN_EMAIL, import.meta.env.VITE_ADMIN_PASSWORD)
  console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

export async function getNotes(notebook: string) {
  if (notebook == '') {
    const notes = await pb.collection('notes').getList(1, 50, {
      expand: 'notebook'
    })
    return notes
  }

  const notes = await pb.collection('notes').getList(1, 50, {
    filter: `notebook == ${notebook}`,
    expand: 'notebook'
  })

  return notes
}

export async function getNotebooks() {
  const notebooks = await pb.collection('notebooks').getFullList()
  return notebooks
}

export async function getNotebook(name: string) {
  const notebook = await pb.collection('notebooks').getFirstListItem(`name='${name}'`)
  return notebook
}

export default pb
