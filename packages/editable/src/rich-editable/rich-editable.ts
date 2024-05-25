import { Editable } from '../editable'
import { AtLeastOne, NewEditableParams } from '../utils'
import { childNodesToTokenList, tokenToElements } from './utils/helpers'
import { InlineStyleAction } from './utils/types'

import './rich-editable.css'

export default class RichEditable extends Editable {
  constructor(params?: AtLeastOne<NewEditableParams>) {
    super(params)

    this.editable.addEventListener('keydown', ev => {
      const { key, ctrlKey, altKey, shiftKey } = ev
      if (ctrlKey && !altKey && !shiftKey) {
        if (key === 'b') {
          ev.preventDefault()
          this.toggleStyle('bold')
        } else if (key === 'i') {
          ev.preventDefault()
          this.toggleStyle('italic')
        }
      }
    })
  }

  private toggleStyle(style: InlineStyleAction) {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    const selectionContent = range.extractContents()
    const selectionTokens = childNodesToTokenList(selectionContent, style)

    for (const token of selectionTokens) {
      const element = tokenToElements(token)
      console.log(element)
      range.insertNode(element)
    }

    selection.removeAllRanges()
    selection.addRange(range)
  }
}
