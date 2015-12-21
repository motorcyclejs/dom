import { run } from '@motorcycle/core'
import { makeDomDriver, h} from '../../../src'
import most from 'most'
import {combineArray} from 'most/lib/combinator/combine'
import map from 'fast.js/array/map'

function InputCount(dom) {
  const id = `.component-count`
  const value$ = dom.select(id)
      .events(`input`)
      .map(ev => ev.target.value)
      .startWith(100)
      .multicast()

  return {
    dom: value$.map(value => h(`input${id}`, {
      props: {
        type: 'range',
        max: 250,
        min: 1,
        value,
      },
      style: {
        width: '100%'
      }
    })),
    value$
  }
}

function CycleJSLogo(id) {
  return {
    dom: most.just(h('div', {
      style: {
        alignItems: 'center',
        background: 'url(./cyclejs_logo.svg)',
        boxSizing: 'border-box',
        display: 'inline-flex',
        fontFamily: 'sans-serif',
        fontWeight: 700,
        fontSize: '8px',
        height: '32px',
        justifyContent: 'center',
        margin: '8px',
        width: '32px'
      }
    }, `${id}`))
  }
}

function view(value, inputCountVTree, componentDOMs) {
  return h('div', [
    h('h2', [`# of Components: ${value}`]),
    inputCountVTree,
    h('div', componentDOMs)
  ])
}

function main(sources) {
  const inputCount = InputCount(sources.dom)

  const components$ = inputCount.value$
    .map(value => combineArray(
      (...components) => components,
      map(Array(parseInt(value)), (v, i) => CycleJSLogo(i+1).dom)
    ))
    .switch()

  return {
    dom: most.combine(view, inputCount.value$, inputCount.dom, components$)
  }
}

run(main, {dom: makeDomDriver(`#test-container`, [
  require('snabbdom/modules/props'),
  require('snabbdom/modules/style')
])});
