import {
  AtLeastOne,
  KeyListenerType,
  KeyMappingType,
  NewLineType
} from '../utils'
import { ENTERKEY } from '../utils/const'

import './editable.css'

type NewEditableParams = {
  element?: HTMLDivElement | null
  newLine?: NewLineType
  placeholder?: string
}

export default class Editable {
  protected readonly editable: HTMLDivElement
  protected keyListeners: Array<KeyListenerType> = []
  protected newLine: NewLineType

  constructor(params?: AtLeastOne<NewEditableParams>) {
    this.editable = params?.element ?? document.createElement('div')
    this.newLine = params?.newLine ?? 'basic'

    this.editable.contentEditable = 'true'
    this.editable.style.outline = 'none'
    if (params?.placeholder)
      this.editable.setAttribute('placeholder', params.placeholder)

    this.editable.addEventListener('emptied', () => {})

    this.editable.addEventListener('keydown', ev => {
      const { key } = ev
      if (key === ENTERKEY) ev.preventDefault()

      this.#_executeKeyListeners(ev)
      this.onNewLine(ev)
    })
  }

  #_executeKeyListeners({ key, shiftKey, altKey, ctrlKey }: KeyboardEvent) {
    this.keyListeners.forEach(
      ({
        keyMap: { alt = false, ctrl = false, key: mapKey = '', shift = false },
        listener
      }) => {
        if (this.#_isNewLineKeyMap({ alt, ctrl, key, shift })) return
        if (
          key === mapKey &&
          shiftKey === shift &&
          altKey === alt &&
          ctrlKey === ctrl
        )
          listener()
      }
    )
  }

  #_isNewLineKeyMap({ alt, ctrl, key, shift }: Required<KeyMappingType>) {
    if (key !== ENTERKEY || alt) return false

    if (ctrl && shift) return this.newLine === 'all'
    if (ctrl) return this.newLine === 'ctrl'
    if (shift) return this.newLine === 'shift'
    return this.newLine === 'basic'
  }

  get Element() {
    return this.editable
  }

  get NewLine() {
    return this.newLine
  }

  set NewLine(newLine: NewLineType) {
    this.newLine = newLine
  }

  addKeyListener(keyMap: KeyMappingType, listener: () => void) {
    this.keyListeners.push({ keyMap, listener })
  }

  protected addNewLine() {
    this.editable.appendChild(document.createElement('br'))
    this.editable.appendChild(document.createElement('br'))
  }

  protected moveCursorToEnd() {
    const range = document.createRange()
    const selection = window.getSelection()

    range.setStart(this.editable, this.editable.childNodes.length)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  protected onNewLine(ev: KeyboardEvent) {
    const { key, altKey, shiftKey, ctrlKey } = ev
    let ctrl = false
    let shift = false
    let ctrlShift = false
    let newLine: NewLineType | undefined

    if (key === ENTERKEY) {
      shift = shiftKey && !altKey && !ctrlKey
      ctrl = ctrlKey && !altKey && !shiftKey
      ctrlShift = shiftKey && ctrlKey && !altKey

      if (ctrlShift) newLine = 'all'
      else if (shift) newLine = 'shift'
      else if (ctrl) newLine = 'ctrl'
      else newLine = 'basic'
    }

    if (newLine && newLine === this.NewLine) {
      this.addNewLine()
      this.moveCursorToEnd()
    }
  }
}
