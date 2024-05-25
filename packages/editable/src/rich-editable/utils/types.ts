import { AtLeastOne } from '../../utils'

export type RitchTextType =
  | 'text'
  | {
      href: string
    }

export type RichTextStyle = {
  bold: boolean
  italic: boolean
  underlined: boolean
  linethrough: boolean
  code: boolean
}

export type RitchTextToken = {
  content: string
  type: RitchTextType
  style?: AtLeastOne<RichTextStyle>
}
