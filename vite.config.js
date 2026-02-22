import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// Get local network IP address (fallback to localhost if unavailable)
function getNetworkIP() {
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
  } catch {
    // e.g. sandbox or restricted env
  }
  return 'localhost'
}

const networkIP = getNetworkIP()
console.log(`🌐 Network IP detected: ${networkIP}`)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173, // Vite default port
    strictPort: false, // Allow port change if 5173 is busy
    hmr: {
      host: networkIP, // Use network IP for HMR
      port: 5173
    },
    proxy: {
      '/api': {
        target: `http://${networkIP}:5000`,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err)
          })
        }
      },
      '/uploads': {
        target: `http://${networkIP}:5000`,
        changeOrigin: true
      }
    }
  }
})
