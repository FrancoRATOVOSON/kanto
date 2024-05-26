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
      if (ctrlKey && !altKey) {
        if (!shiftKey) {
          if (key === 'b') {
            ev.preventDefault()
            this.toggleStyle('bold')
          } else if (key === 'i') {
            ev.preventDefault()
            this.toggleStyle('italic')
          } else if (key === 'u') {
            ev.preventDefault()
            this.toggleStyle('underlined')
          } else if (key === 'e') {
            ev.preventDefault()
            this.toggleStyle('code')
          }
        } else {
          if (key === 'X') {
            ev.preventDefault()
            this.toggleStyle('linethrough')
          }
        }
      }
    })
  }

  private toggleStyle(style: InlineStyleAction) {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    const insertStyle = () => {
      const selectionContent = range.extractContents()
      const selectionTokens = childNodesToTokenList(selectionContent, { style })

      for (let index = selectionTokens.length - 1; index >= 0; index--) {
        const element = tokenToElements(selectionTokens[index])
        range.insertNode(element)
      }
    }

    const breakElement = () => {
      const element =
        range.startContainer.nodeType === Node.ELEMENT_NODE || !range.startContainer.parentElement
          ? range.startContainer
          : range.startContainer.parentElement
      const currentStyle = getElementStyle(element as Element)

      const textContent = element.textContent ?? range.toString()
      const elementType =
        element.nodeName.toLowerCase() === 'a'
          ? { href: (element as HTMLAnchorElement).href }
          : 'text'

      const textBefore = textContent.slice(0, range.startOffset)
      if (textBefore)
        this.editable.insertBefore(
          tokenToElements({
            content: textBefore,
            type: elementType,
            style: currentStyle
          }),
          element
        )

      const selectionElement = tokenToElements(
        childNodesToTokenList(range.cloneContents(), {
          style,
          default: currentStyle
        })[0]
      )
      this.editable.insertBefore(selectionElement, element)

      const textAfter = textContent.slice(range.endOffset)
      if (textAfter)
        this.editable.insertBefore(
          tokenToElements({
            content: textAfter,
            type: elementType,
            style: currentStyle
          }),
          element
        )

      this.editable.removeChild(element)
      range.selectNodeContents(selectionElement)
    }

    const isSignleNodeSelection = range.startContainer === range.endContainer
    const isDirectChild =
      range.startContainer.parentElement && range.startContainer.parentElement === this.editable

    if (isSignleNodeSelection && !isDirectChild) breakElement()
    else insertStyle()

    selection.removeAllRanges()
    selection.addRange(range)
  }
}
