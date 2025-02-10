'use client'

import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { rust } from '@codemirror/lang-rust'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

interface CodeEditorProps {
  content: string
  onChange?: (value: string) => void
}

export default function CodeEditor({ content, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of(defaultKeymap),
        rust(),
        EditorView.theme({
          '&': { 
            height: '100%',
            backgroundColor: '#252526'
          },
          '.cm-content': { fontFamily: 'monospace' },
          '.cm-line': { padding: '0 4px' },
          '.cm-gutters': { backgroundColor: '#1E1E1E', borderRight: '1px solid #2D2D2D' },
          '.cm-activeLineGutter': { backgroundColor: '#2D2D2D' },
          '.cm-activeLine': { backgroundColor: '#2D2D2D' },
          '.cm-selectionBackground': { backgroundColor: '#264F78' },
          '&.cm-focused .cm-selectionBackground': { backgroundColor: '#264F78' },
          '.cm-content, .cm-gutter': { backgroundColor: '#252526' },
          '.cm-keyword': { color: '#C586C0' },
          '.cm-operator': { color: '#D4D4D4' },
          '.cm-string': { color: '#CE9178' },
          '.cm-comment': { color: '#6A9955' },
          '.cm-function': { color: '#DCDCAA' },
          '.cm-variable': { color: '#9CDCFE' },
          '.cm-property': { color: '#9CDCFE' },
          '.cm-type': { color: '#4EC9B0' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    return () => view.destroy()
  }, [content])

  return <div ref={editorRef} className="h-full bg-[#252526]" />
} 