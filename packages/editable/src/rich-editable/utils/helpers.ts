import {
  FONTSTYLE_ATTRIBUTE,
  FONTWEIGHT_ATTRIBUTE,
  INLINECODE_ATTRIBUTE,
  LINETHROUGH_ATTRIBUTE,
  UNDERLINED_ATTRIBUTE
} from './const'
import { InlineStyleAction, RitchTextToken, RitchTextType } from './types'

export function childNodesToTokenList(parent: Node, style?: InlineStyleAction) {
  const tokenList: Array<RitchTextToken> = []

  for (const [index, node] of parent.childNodes.entries()) {
    const token = getTokenFromNode(node, style)
    if (!token) {
      parent.removeChild(node)
      continue
    }

    if (index > 0) {
      const lastToken = tokenList.at(-1)
      const prevNode = parent.childNodes.item(index - 1)

      if (lastToken && prevNode.nodeType === Node.TEXT_NODE && node.nodeType === Node.TEXT_NODE) {
        lastToken.content = lastToken.content + token.content
        continue
      }
    }

    tokenList.push(token)
  }

  return tokenList
}

export function getTokenFromNode(node: Node, style?: InlineStyleAction): RitchTextToken | null {
  const textContent = node.textContent
  if (!textContent) return null
  if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) return null

  let tokenType: RitchTextType = !style || typeof style === 'string' ? 'text' : style

  if (node.nodeType === Node.TEXT_NODE)
    return {
      content: textContent,
      type: tokenType,
      style:
        typeof style === 'string'
          ? {
              bold: style === 'bold',
              italic: style === 'italic',
              code: style === 'code',
              underlined: style === 'underline',
              linethrough: style === 'linethrough'
            }
          : undefined
    }

  const fontWeight = (node as Element).getAttribute(FONTWEIGHT_ATTRIBUTE)
  const fontStyle = (node as Element).getAttribute(FONTSTYLE_ATTRIBUTE)
  const inlineCode = (node as Element).getAttribute(INLINECODE_ATTRIBUTE)
  const underlined = (node as Element).getAttribute(UNDERLINED_ATTRIBUTE)
  const linethrough = (node as Element).getAttribute(LINETHROUGH_ATTRIBUTE)

  if (style) {
    if (typeof style !== 'string') tokenType = style
    else tokenType = 'text'
  } else tokenType = node.nodeName === 'a' ? { href: (node as HTMLAnchorElement).href } : 'text'

  return {
    content: textContent,
    type: tokenType,
    style:
      node.nodeName === 'span'
        ? {
            bold: !(style === 'bold' && !!fontWeight),
            code: !(style === 'code' && !!inlineCode),
            italic: !(style === 'italic' && !!fontStyle),
            linethrough: !(style === 'linethrough' && !!linethrough),
            underlined: !(style === 'underline' && !!underlined)
          }
        : undefined
  }
}

export function tokenToElements(token: RitchTextToken): Node {
  const { content, type: tokenType, style } = token
  const textContent = document.createTextNode(content)

  if (tokenType === 'text' && !style) return textContent

  let element: HTMLSpanElement | HTMLAnchorElement

  if (tokenType === 'text') element = document.createElement('span')
  else {
    element = document.createElement('a')
    if (element instanceof HTMLAnchorElement) element.href = tokenType.href
  }

  if (style) {
    if (style.bold) element.setAttribute(FONTWEIGHT_ATTRIBUTE, 'bold')
    if (style.code) element.setAttribute(INLINECODE_ATTRIBUTE, 'true')
    if (style.italic) element.setAttribute(FONTSTYLE_ATTRIBUTE, 'italic')
    if (style.linethrough) element.setAttribute(LINETHROUGH_ATTRIBUTE, 'true')
    if (style.underlined) element.setAttribute(UNDERLINED_ATTRIBUTE, 'true')
  }

  element.appendChild(textContent)

  return element
}

export function getRangePosition(range: Range) {
  const parent =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer

  if (parent) {
    const start = getPositionWithinParent(parent, range.startContainer, range.startOffset)
    const end = getPositionWithinParent(parent, range.endContainer, range.endOffset)

    return { start, end }
  }
  return null
}

export function getPositionWithinParent(parent: Node, child: Node, childOffset: number) {
  if (!parent.contains(child)) {
    return -1
  }

  let pos = 0
  for (const node of parent.childNodes) {
    if (node === child) {
      pos += childOffset
      break
    }

    if (node.contains(child)) {
      pos += getPositionWithinParent(node, child, childOffset)
      break
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent
      if (textContent) {
        pos += textContent.length
        break
      }
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const outerHTML = (node as Element).outerHTML
      if (outerHTML) pos += outerHTML.length
    }
  }

  if (parent.nodeType !== Node.TEXT_NODE) {
    pos += (parent as Element).outerHTML.lastIndexOf((parent as Element).innerHTML)
  }
  return pos
}
