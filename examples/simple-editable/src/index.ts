import { Editable } from 'editable'

const editor = document.getElementById('editor')

function addLine() {
  const newEditable = new Editable('basic')
  newEditable.addKeyListener({ key: 'Enter', ctrl: true }, addLine)

  editor?.appendChild(newEditable.Element)
  newEditable.Element.focus()
}

addLine()
