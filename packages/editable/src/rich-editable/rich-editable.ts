import { Editable } from '../editable'
import { AtLeastOne, NewEditableParams } from '../utils'

export default class RichEditable extends Editable {
  constructor(params?: AtLeastOne<NewEditableParams>) {
    super(params)
  }
}
