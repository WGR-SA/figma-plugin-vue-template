# Figma Plugin Vue Template

Template for building Figma plugins using Vue.js.

## Features

- 🔄 Vue 3 Composition API
- 📦 Vite for fast development and building
- 🎨 TypeScript support
- 🧱 Component-based architecture
- 🔌 Easy communication between UI and plugin code
- 🖌️ SCSS/CSS styling support

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Figma Desktop App](https://www.figma.com/downloads/)

### Installation

1. Clone this repository or use it as a template:

```bash
git clone https://github.com/WGR-SA/figma-plugin-vue-template
# or
# Click "Use this template" on GitHub
```

2. Navigate to the project directory:

```bash
cd figma-plugin-vue-template
```

3. Install dependencies:

```bash
npm install
# or
yarn
```

### Development

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open the Figma desktop app.

3. Go to `Plugins > Development > Import plugin from manifest...`

4. Select the `manifest.json` file from your project directory.

5. Run your plugin via `Plugins > Development > [Your Plugin Name]`

### Building for Production

```bash
npm run build
# or
yarn build
```

This will generate a production-ready build in the `dist` directory.

## Project Structure

```
figma-plugin-vue-template/
├── ui-src/
│   ├── assets/            # Assets
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── App.vue            # Main UI component
│   ├── ui.html            # HTML template
│   └── main.ts            # Entry point for UI
├── plugin-src/            # Figma plugin code
├── manifest.json          # Figma plugin manifest
└── vite.config.ts         # Vite config
```

## Communication Between UI and Plugin

### The `useFigma` Composable

This template includes a Vue composable that manages communication between your Vue UI and the Figma plugin code:

```typescript
// src/composables/useFigma.ts
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
```

### Using the Composable in Components:

```typescript
// In a Vue component
<script setup lang="ts">
import { useFigma } from '@/composables/useFigma'
import { watch } from 'vue'

const { isConnected, error, messageQueue, postMessage, clearMessageQueue } = useFigma()

// Send a message to the Figma plugin
function selectNode(id: string) {
  postMessage({ 
    type: 'SELECT_NODE', 
    payload: { id } 
  })
}

// Watch for incoming messages from the plugin
watch(messageQueue, (messages) => {
  messages.forEach(msg => {
    if (msg.type === 'SELECTION_CHANGED') {
      // Handle selection changed event
      console.log('Selection changed:', msg.payload)
    }
  })
  
  // Clear the queue after processing
  clearMessageQueue()
}, { deep: true })
</script>
```

### From Plugin to UI:

```typescript
// In code.ts
figma.ui.postMessage({ 
  type: 'SELECTION_CHANGED', 
  payload: { 
    selectedNodes: figma.currentPage.selection.map(node => node.id)
  } 
})
```

## Customization

### Plugin Information

Edit the `manifest.json` file to update your plugin's name, ID, and other metadata.

### UI Styling

The template uses SCSS for styling. You can customize the global styles in the `src/styles` directory.

### Understanding the Figma Composable

The `useFigma` composable provides several key features:

1. **Connection Management**:
   - Automatically connects to the Figma plugin environment
   - Tracks connection state with `isConnected` ref
   - Cleans up event listeners when component is unmounted

2. **Error Handling**:
   - Captures and exposes communication errors
   - Provides utilities to clear errors as needed

3. **Message Queue**:
   - Maintains a queue of incoming messages from the plugin
   - Lets you process messages in batches or individually
   - Provides utility to clear the queue after processing

4. **Bidirectional Communication**:
   - `postMessage()` sends messages to the plugin
   - Automatically captures incoming messages
   - Standardizes message format with type and payload structure

## Deploying to Figma

To publish your plugin to the Figma Community:

1. Build your plugin for production.
2. Go to the Figma desktop app.
3. Navigate to `Plugins > Development > [Your Plugin Name] > Manage published plugin`.
4. Follow the instructions to publish your plugin.

## Additional Resources

- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Documentation](https://vitejs.dev/guide/)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.