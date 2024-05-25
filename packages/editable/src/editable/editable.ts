import {
  AtLeastOne,
  KeyListenerType,
  KeyMappingType,
  NewLineType,
  BACKSPACEKEY,
  DELETEKEY,
  ENTERKEY,
  isEndOfLine,
  isEmptyLine,
  getNextLineSibling,
  NewEditableParams
} from '../utils'

import './editable.css'

export default class Editable {
  private onDeleteWhenEmpty: (
    key: typeof BACKSPACEKEY | typeof DELETEKEY
  ) => void = () => {}

  protected readonly editable: HTMLDivElement
  protected keyListeners: Array<KeyListenerType> = []
  protected newLine: NewLineType

  constructor(params?: AtLeastOne<NewEditableParams>) {
    this.editable = params?.element ?? document.createElement('div')
    this.newLine = params?.newLine ?? 'basic'

    this.editable.contentEditable = 'true'
    this.editable.style.outline = 'none'
    this.editable.style.whiteSpace = 'pre-wrap'

    if (params?.placeholder)
      this.editable.setAttribute('placeholder', params.placeholder)

    this.editable.addEventListener('emptied', () => {})

    this.editable.addEventListener('keydown', ev => {
      const { key, altKey, ctrlKey, shiftKey } = ev
      if (key === ENTERKEY) ev.preventDefault()

      if (!altKey && !ctrlKey && !shiftKey) {
        if (key === BACKSPACEKEY || key === DELETEKEY) {
          if (this.editable.childNodes.length === 0) {
            ev.preventDefault()
            this.onDeleteWhenEmpty(key)
            return
          } else {
            const firstChild = this.editable.childNodes[0]
            if (firstChild.textContent === '\n' || firstChild.nodeName === 'br')
              this.editable.removeChild(firstChild)
          }
        }
      }

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
    const selection = window.getSelection()
    if (selection) {
      const range = selection.getRangeAt(0)

      range.deleteContents()
      range.collapse(true)

      if (isEndOfLine(range) || isEmptyLine(range))
        range.insertNode(document.createTextNode('\n'))
      range.insertNode(document.createTextNode('\n'))

      const newLineNode = getNextLineSibling(range.startContainer)
      if (newLineNode) this.moveCursorTo(newLineNode)
    }
  }

  focus(position?: number | 'start' | 'end') {
    this.editable.focus()

    if (position === 'end') this.moveCursorTo(this.editable)
  }

  protected getCaretPosition() {
    const selection = window.getSelection()
    const node =
      this.editable.childNodes.length > 0
        ? this.editable.childNodes[0]
        : this.editable

    return {
      node: selection?.anchorNode ?? node,
      offset: selection?.anchorOffset ?? 0
    }
  }

  protected moveCursorTo(node: Node, position: number = 0) {
    const range = document.createRange()
    const selection = window.getSelection()
    range.setStart(node, position)
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

    if (newLine && newLine === this.NewLine) this.addNewLine()
  }

  setOnDeleteWhenEmpty(
    action: (_key: typeof BACKSPACEKEY | typeof DELETEKEY) => void
  ) {
    this.onDeleteWhenEmpty = action
  }
}
