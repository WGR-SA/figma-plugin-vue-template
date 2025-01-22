import { ref, onMounted, onUnmounted } from 'vue'

interface FigmaMessage {
  type: string
  [key: string]: unknown
}

export function useFigma() {
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const messageQueue = ref<FigmaMessage[]>([])

  // Handler for receiving messages from Figma
  const handleMessage = (event: MessageEvent) => {
    const { type, payload } = event.data.pluginMessage || {}

    if (!type) {
      console.warn('Received message without type:', event.data)
      return
    }

    switch (type) {
      case 'CONNECTED':
        isConnected.value = true
        break
      case 'ERROR':
        error.value = payload?.message || 'Unknown error occurred'
        break
      default:
        messageQueue.value.push({ type, payload })
    }
  }

  const postMessage = (message: FigmaMessage) => {
    if (!isConnected.value) {
      console.warn('Not connected to Figma')
      return
    }

    try {
      parent.postMessage({ pluginMessage: message }, 'https://www.figma.com')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to post message'
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearMessageQueue = () => {
    messageQueue.value = []
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage)
    isConnected.value = true
  })

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
    isConnected.value = false
    clearMessageQueue()
    clearError()
  })

  return {
    isConnected,
    error,
    messageQueue,
    postMessage,
    clearError,
    clearMessageQueue
  }
}