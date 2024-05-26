import { AtLeastOne } from '../../utils'
import {
  FONTSTYLE_ATTRIBUTE,
  FONTWEIGHT_ATTRIBUTE,
  INLINECODE_ATTRIBUTE,
  INLINE_STYLE_ACTION,
  LINETHROUGH_ATTRIBUTE,
  UNDERLINED_ATTRIBUTE
} from './const'
import { InlineStyleAction, RichTextStyle, RitchTextToken, RitchTextType } from './types'

type StyleOptions = {
  default: RichTextStyle
  style: InlineStyleAction
}

export function childNodesToTokenList(parent: Node, style?: AtLeastOne<StyleOptions>) {
  const tokenList: Array<RitchTextToken> = []

  for (const [index, node] of parent.childNodes.entries()) {
    const token = getTokenFromNode(node, style)
    if (!token) {
      parent.removeChild(node)
      continue
    }

    if (index > 0) {
      const lastToken = tokenList[tokenList.length - 1]
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

function getStyleFromDefault(style: AtLeastOne<StyleOptions>): RichTextStyle | undefined {
  if (!style) return undefined
  if (typeof style.style !== 'string') return style.default

  const newStyle: RichTextStyle = {
    bold: false,
    italic: false,
    underlined: false,
    code: false,
    linethrough: false
  }

  INLINE_STYLE_ACTION.forEach(inlineStyle => {
    newStyle[inlineStyle] = style.style === inlineStyle
    if (style.default) {
      newStyle[inlineStyle] = style.default[inlineStyle]
      if (style.style === inlineStyle) newStyle[inlineStyle] = !style.default[inlineStyle]
    }
  })

  return newStyle
}

function getElementDefaultStyle(element: Element): RichTextStyle {
  return {
    bold: INLINE_STYLE_ACTION[0] === element.getAttribute(FONTWEIGHT_ATTRIBUTE),
    italic: INLINE_STYLE_ACTION[1] === element.getAttribute(FONTSTYLE_ATTRIBUTE),
    underlined: INLINE_STYLE_ACTION[2] === element.getAttribute(INLINECODE_ATTRIBUTE),
    linethrough: INLINE_STYLE_ACTION[3] === element.getAttribute(LINETHROUGH_ATTRIBUTE),
    code: INLINE_STYLE_ACTION[4] === element.getAttribute(INLINECODE_ATTRIBUTE)
  }
}

function updateStyleBasedOnToggle(
  defaultStyle: RichTextStyle,
  style: Exclude<InlineStyleAction, { href: string }>
) {
  return {
    bold: !(style === 'bold' && defaultStyle.bold),
    italic: !(style === 'italic' && defaultStyle.italic),
    underlined: !(style === 'underlined' && defaultStyle.underlined),
    linethrough: !(style === 'linethrough' && defaultStyle.linethrough),
    code: !(style === 'code' && defaultStyle.code)
  }
}

function hasEffectiveStyle(
  defaultStyle: RichTextStyle,
  tokenType: RitchTextType,
  style?: AtLeastOne<StyleOptions>
): boolean {
  const hasAttributes = Object.values(defaultStyle).some(value => value === true)
  return (
    tokenType !== 'text' ||
    (tokenType === 'text' && (hasAttributes || typeof style?.style === 'string'))
  )
}

export function getTokenFromNode(
  node: Node,
  style?: AtLeastOne<StyleOptions>
): RitchTextToken | null {
  const textContent = node.textContent
  if (!textContent) return null
  if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) return null

  let tokenType: RitchTextType =
    !style?.style || typeof style.style === 'string' ? 'text' : style.style

  if (node.nodeType === Node.TEXT_NODE)
    return {
      content: textContent,
      type: tokenType,
      style: style ? getStyleFromDefault(style) : undefined
    }

  let defaultStyle: RichTextStyle = getElementDefaultStyle(node as Element)

  if (style && typeof style.style === 'string') {
    defaultStyle = updateStyleBasedOnToggle(defaultStyle, style.style)
  } else if (node.nodeName.toLowerCase() === 'a')
    tokenType = { href: (node as HTMLAnchorElement).href }

  const hasStyle = hasEffectiveStyle(defaultStyle, tokenType, style)

  return {
    content: textContent,
    type: tokenType,
    style: hasStyle ? defaultStyle : undefined
  }
}

export function tokenToElements(token: RitchTextToken): Node {
  const { content, type: tokenType, style } = token
  const textContent = document.createTextNode(content)

  if (tokenType === 'text' && (!style || !Object.values(style).some(value => value === true)))
    return textContent

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

export function getElementStyle(element: Element): RichTextStyle {
  const fontWeight = element.getAttribute(FONTWEIGHT_ATTRIBUTE)
  const fontStyle = element.getAttribute(FONTSTYLE_ATTRIBUTE)
  const inlineCode = element.getAttribute(INLINECODE_ATTRIBUTE)
  const underlined = element.getAttribute(UNDERLINED_ATTRIBUTE)
  const linethrough = element.getAttribute(LINETHROUGH_ATTRIBUTE)

  return {
    bold: !!fontWeight,
    code: !!inlineCode,
    italic: !!fontStyle,
    linethrough: !!linethrough,
    underlined: !!underlined
  }
}

/// ///////////////////////////////////////////////////////////////////////////////////////

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
