export function isEndOfLine(range: Range) {
  if (range.startContainer.textContent) {
    const textLength = range.startContainer.textContent.length

    return textLength > 0 && textLength === range.startOffset
  }
  return false
}

export function isEmptyLine(range: Range) {
  return (
    range.startContainer.textContent === null ||
    range.startContainer.textContent.length === 0
  )
}
