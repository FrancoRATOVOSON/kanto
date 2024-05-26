import { AtLeastOne } from '../../utils'
import { INLINE_STYLE_ACTION } from './const'

export type RitchTextType =
  | 'text'
  | {
      href: string
    }

export type InlineStyleAction = (typeof INLINE_STYLE_ACTION)[number] | { href: string }

export type RichTextStyle = Record<Exclude<InlineStyleAction, { href: string }>, boolean>

export type RitchTextToken = {
  content: string
  type: RitchTextType
  style?: AtLeastOne<RichTextStyle>
}
