import { Editable } from 'editable'

const editor = document.getElementById('editor')

function addLine(editable: Editable) {
  editable.addKeyListener({ key: 'Enter', ctrl: true }, () =>
    addLine(new Editable({ newLine: 'basic' }))
  )

  editor?.appendChild(editable.Element)
  editable.Element.focus()
}

addLine(new Editable({ newLine: 'basic', placeholder: 'First Line' }))
