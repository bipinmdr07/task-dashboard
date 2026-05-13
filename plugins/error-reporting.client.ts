import { useNotificationStore } from '~/stores/useNotificationStore'

const GENERIC = 'Something went wrong. Please try again.'

function isLikelyFetchError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err
}

function notifyGenericError() {
  try {
    useNotificationStore().notify('error', GENERIC)
  } catch {
    // Pinia might not be ready yet (very early boot errors) — swallow so we don't loop
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => {
    if (import.meta.dev) console.error('[vue error]', err, info)
    // Fetch failures already surface their own UI, no need to double up
    if (isLikelyFetchError(err)) return
    notifyGenericError()
  }

  nuxtApp.hook('app:error', err => {
    if (import.meta.dev) console.error('[app:error]', err)
    if (isLikelyFetchError(err)) return
    notifyGenericError()
  })
})
