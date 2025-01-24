import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'ask-virtual-healthcare',
  api: {
    projectId: 'aazj2t9c',
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
