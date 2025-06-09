import { RawCommands } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setFontSize: {
      /**
       * Set the font size for the text style.
       */
      setFontSize: (fontSize: string) => ReturnType
    }
    unsetFontSize: {
      /**
       * Unset the font size for the text style.
       */
      unsetFontSize: () => ReturnType
    }
  }
}