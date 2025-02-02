import type { Plugin } from 'rolldown'
import { reload } from './reloadPlugin'

export const getPlugins = (): Plugin[] => [
  reload(),
]
