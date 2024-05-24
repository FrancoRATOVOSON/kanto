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
    const backspace = key === 'Backspace' && currentIndex > 0
    const del =
      key === 'Delete' &&
      currentIndex >= 0 &&
      currentIndex < editorLines.length - 1

    if ((backspace || del) && editorLines.length > 1) {
      editor?.removeChild(editable.Element)
      editorLines = [...editorLines.filter(line => line !== editable)]

      editorLines.at(backspace ? currentIndex - 1 : currentIndex)?.focus('end')
    }
  })

  editor?.appendChild(editable.Element)
  editable.Element.focus()
}

addLine(new Editable({ newLine: 'basic', placeholder: 'First Line' }))
