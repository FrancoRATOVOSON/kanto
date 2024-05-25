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

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U]
