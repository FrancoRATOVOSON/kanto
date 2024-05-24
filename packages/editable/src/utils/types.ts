export type NewLineType = 'basic' | 'shift' | 'ctrl' | 'all'

export type KeyMappingType = {
  key?: string
  alt?: boolean
  ctrl?: boolean
  shift?: boolean
}

export type KeyListenerType = {
  keyMap: KeyMappingType
  listener: () => void
}
