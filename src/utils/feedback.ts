import { showConfirmDialog, showToast } from 'vant'

type ConfirmOptions = Parameters<typeof showConfirmDialog>[0]

export function toast(message: string) {
  try {
    showToast(message)
  } catch (error) {
    console.error('Toast display failed:', error)
  }
}

export function confirmDialog(options: ConfirmOptions) {
  return showConfirmDialog(options)
}
