# Set shell for Windows OSs:
# set windows-shell := ['cmd', '/c']
# set windows-shell := ["C:/Program Files/Git/usr/bin/bash.exe", "-c"]
set windows-shell := ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]

default: 
  just --list --unsorted

install:
	concurrently "cd svelte-app && bun install --force" "cd electron-app && bun install --force"

dev: 
  concurrently "cd svelte-app && bun run dev" "cd electron-app && bun run dev"

dev-frontend:
	concurrently "cd svelte-app && bun run dev"

build: full-svelte
	concurrently "cd electron-app && bun run build:win"

build-only: 
	concurrently "cd electron-app && bun run build:win"

full-svelte: build-svelte prep-svelte move-svelte

build-svelte:
  concurrently "cd svelte-app && bun run build"

prep-svelte:
	sd -F '/_app' './_app' svelte-app/build/index.html	

build-pb-types:
	concurrently "cd electron-app && bunx pocketbase-typegen --db ./db/pb_data/data.db --out ../svelte-app/src/lib/types/pb-types.ts"

move-svelte:
	if (Test-Path "electron-app\out\renderer") { Remove-Item -Recurse -Force "electron-app\out\renderer" }; 
	New-Item -ItemType Directory -Force -Path "electron-app\out\renderer" | Out-Null; 
	Copy-Item -Path "svelte-app\build\*" -Destination "electron-app\out\renderer" -Recurse