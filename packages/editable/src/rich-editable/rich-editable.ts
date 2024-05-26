import { Editable } from '../editable'
import { AtLeastOne, NewEditableParams } from '../utils'
import { childNodesToTokenList, getElementStyle, tokenToElements } from './utils/helpers'
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

    if (range.startContainer === range.endContainer) {
      if (this.editable.childNodes.length === 1 && range.startContainer === this.editable.firstChild) {
        const selectionContent = range.extractContents()
        const selectionTokens = childNodesToTokenList(selectionContent, { style })

        for (let index = selectionTokens.length - 1; index >= 0; index--) {
          const element = tokenToElements(selectionTokens[index])
          range.insertNode(element)
        }
      } else {
        const element =
          range.startContainer.nodeType === Node.ELEMENT_NODE || !range.startContainer.parentElement
            ? range.startContainer
            : range.startContainer.parentElement
        const currentStyle = getElementStyle(element as Element)
        const selectionContent = range.cloneContents()
        const selectionTokens = childNodesToTokenList(selectionContent, { style, default: currentStyle })

        const textContent = element.textContent ?? range.toString()
        const elementType =
          element.nodeName.toLowerCase() === 'a' ? { href: (element as HTMLAnchorElement).href } : 'text'
        const before = tokenToElements({
          content: textContent.slice(0, range.startOffset),
          type: elementType,
          style: currentStyle
        })
        const after = tokenToElements({
          content: textContent.slice(range.endOffset),
          type: elementType,
          style: currentStyle
        })

        this.editable.insertBefore(before, element)
        const selectionElement = tokenToElements(selectionTokens[0])
        this.editable.insertBefore(selectionElement, element)
        this.editable.insertBefore(after, element)

        this.editable.removeChild(element)

        range.selectNodeContents(selectionElement)
      }
    }

    selection.removeAllRanges()
    selection.addRange(range)
  }
}
