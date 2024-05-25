import {
  FONTSTYLE_ATTRIBUTE,
  FONTWEIGHT_ATTRIBUTE,
  INLINECODE_ATTRIBUTE,
  LINETHROUGH_ATTRIBUTE,
  UNDERLINED_ATTRIBUTE
} from './const'
import { RitchTextToken } from './types'

export function getTokenFromNode(node: Node): RitchTextToken | null {
  const textContent = node.textContent
  if (!textContent) return null
  if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) return null

  if (node.nodeType === Node.TEXT_NODE)
    return {
      content: textContent,
      type: 'text'
    }

  const fontWeight = (node as Element).getAttribute(FONTWEIGHT_ATTRIBUTE)
  const fontStyle = (node as Element).getAttribute(FONTSTYLE_ATTRIBUTE)
  const inlineCode = (node as Element).getAttribute(INLINECODE_ATTRIBUTE)
  const underlined = (node as Element).getAttribute(UNDERLINED_ATTRIBUTE)
  const linethrough = (node as Element).getAttribute(LINETHROUGH_ATTRIBUTE)

  return {
    content: textContent,
    type: node.nodeName === 'a' ? { href: (node as HTMLAnchorElement).href } : 'text',
    style:
      node.nodeName === 'span'
        ? {
            bold: !!fontWeight,
            code: !!inlineCode,
            italic: !!fontStyle,
            linethrough: !!linethrough,
            underlined: !!underlined
          }
        : undefined
  }
}
