import chokidar from 'chokidar'

export const createFileWatcher = (
  onChange: (eventName: string, path: string) => void,
) => {
  const watcher = chokidar.watch('.', {
    ignored: [
      'node_modules',
      '.git',
      '.micro-vite',
    ],
    ignoreInitial: true, // listen 開始時は発火させない
  })

  watcher.on('all', (eventName, path) => {
    onChange(eventName, path) // なにか変更されたら onChange を呼ぶ
  })
}
