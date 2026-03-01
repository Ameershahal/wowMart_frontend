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
if (process.env.NODE_ENV !== 'production') {
  console.log(`🌐 Network IP detected: ${networkIP}`)
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'axios': ['axios'],
        },
      },
    },
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 500,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    host: '127.0.0.1', // Avoid os.networkInterfaces() issues; use 0.0.0.0 for LAN
    port: 5173, // Vite default port
    strictPort: false, // Allow port change if 5173 is busy
    hmr: {
      host: networkIP,
      port: 5173
    },
    proxy: {
      '/api': {
        target: `http://${networkIP}:5001`,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err)
          })
        }
      },
      '/uploads': {
        target: `http://${networkIP}:5001`,
        changeOrigin: true
      }
    }
  }
}))
