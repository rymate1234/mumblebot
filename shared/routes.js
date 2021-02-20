/* eslint-disable no-undef */
import list from './list'
import Songs from './Songs'
import { getSongs, getStations } from './api'

export default {
  '/': {
    name: 'Home',
    component: Songs,
    getData: getSongs,
  },
  '/all': {
    name: 'Home',
    component: Songs,
    getData: getSongs,
  },
  '/radio': {
    name: 'Radio',
    component: list,
    getData: getStations,
  },
  '/radio/all': {
    name: 'Radio',
    component: list,
    getData: getStations,
  },
}
