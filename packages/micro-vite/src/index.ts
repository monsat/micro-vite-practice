import cac from 'cac'
import { startDev } from './dev'
import { startBuild } from './build'

const cli = cac()

cli.command('dev')
  .action(async () => {
    await startDev()
  })

cli.command('build')
  .action(async () => {
    await startBuild()
  })

cli.help()

cli.parse()
