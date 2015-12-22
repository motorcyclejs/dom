import h from 'snabbdom/h'
import thunk from 'snabbdom/thunk'
const hh = require(`hyperscript-helpers`)(h)
import makeDOMDriver from './makeDOMDriver'

import assign from 'fast.js/object/assign'

module.exports = assign({makeDOMDriver, h, thunk}, hh)
