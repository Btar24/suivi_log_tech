import { create } from 'zustand'

let timer = null

export const useToastStore = create((set) => ({
  msg: '',
  visible: false,
  show: (msg) => {
    if (timer) clearTimeout(timer)
    set({ msg, visible: true })
    timer = setTimeout(() => set({ visible: false }), 3000)
  },
}))

export const toast = (msg) => useToastStore.getState().show(msg)
