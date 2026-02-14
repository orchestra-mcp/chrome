import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

const isContentBuild = process.env.BUILD_TARGET === 'content'

// Dynamic @plugin/* aliases from vite.plugins.json (if present)
// Go generator outputs: { "pluginId": { "namespace": "browser", "path": "/abs/path" } }
function loadPluginAliases(): Record<string, string> {
  const filePath = resolve(__dirname, 'vite.plugins.json')
  if (!existsSync(filePath)) return {}
  const data: Record<string, { namespace: string; path: string }> = JSON.parse(readFileSync(filePath, 'utf-8'))
  const aliases: Record<string, string> = {}
  for (const [, entry] of Object.entries(data)) {
    aliases[`@plugin/${entry.namespace}`] = entry.path
  }
  return aliases
}

// Dedupe packages from vite.scripts.json (if present)
// Go generator outputs: ["react", "react-dom", ...]
function loadDedupePackages(): string[] {
  const filePath = resolve(__dirname, 'vite.scripts.json')
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

const pluginAliases = loadPluginAliases()
const dedupePackages = loadDedupePackages()

const baseConfig: UserConfig = {
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      ...pluginAliases,
    },
    dedupe: dedupePackages.length > 0 ? dedupePackages : undefined,
  },
}

const contentConfig: UserConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/content/index.ts'),
      output: {
        entryFileNames: 'content.js',
        format: 'iife' as const,
        inlineDynamicImports: true,
      },
    },
  },
}

const mainConfig: UserConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}

export default defineConfig(isContentBuild ? contentConfig : mainConfig)
