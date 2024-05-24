import { Editable } from 'editable'

const editor = document.getElementById('editor')
let editorLines: Array<Editable> = []

function addLine(editable: Editable) {
  editorLines.push(editable)
  editable.addKeyListener({ key: 'Enter', ctrl: true }, () =>
    addLine(new Editable({ newLine: 'basic' }))
  )
  editable.setOnDeleteWhenEmpty(key => {
    const currentIndex = editorLines.findIndex(line => line === editable)

    if (editorLines.length > 1) {
      editor?.removeChild(editable.Element)
      editorLines = editorLines.filter(line => line !== editable)
    }

    if (key === 'Backspace' && currentIndex > 0)
      editorLines.at(currentIndex - 1)?.focus('end')
    if (
      key === 'Delete' &&
      currentIndex >= 0 &&
      currentIndex < editorLines.length
    )
      editorLines.at(currentIndex)?.focus()
  })

  editor?.appendChild(editable.Element)
  editable.Element.focus()
}

addLine(new Editable({ newLine: 'basic', placeholder: 'First Line' }))
