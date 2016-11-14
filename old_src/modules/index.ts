import { Module } from '../interfaces'

declare function require(package: string): Module
const ClassModule = require('snabbdom/modules/class')
const PropsModule = require('snabbdom/modules/props')
const AttrsModule = require('snabbdom/modules/attributes')
const EventsModule = require('snabbdom/modules/eventlisteners')
const StyleModule = require('snabbdom/modules/style')
const HeroModule = require('snabbdom/modules/hero')
const DataSetModule = require('snabbdom/modules/dataset')

export default [StyleModule, ClassModule, PropsModule, AttrsModule]

export {
  StyleModule, ClassModule,
  PropsModule, AttrsModule,
  HeroModule, EventsModule,
  DataSetModule
}
