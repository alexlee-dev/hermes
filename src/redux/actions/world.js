// * ACTION TYPES
const SET_TIMER_RUNNING = 'SET_TIMER_RUNNING'
const REMOVE_ITEM = 'REMOVE_ITEM'
const SET_PLANETS = 'SET_PLANETS'
const CLEAR_ITEMS = 'CLEAR_ITEMS'
const REFRESH_ITEMS = 'REFRESH_ITEMS'

// * ACTION GENERATORS
export const setPlanets = planets => ({
  type: SET_PLANETS,
  payload: { planets }
})

export const setTimerRunning = isTimerRunning => ({
  type: SET_TIMER_RUNNING,
  payload: { isTimerRunning }
})

export const removeItem = item => ({
  type: REMOVE_ITEM,
  payload: {
    item
  }
})

export const clearItems = () => ({ type: CLEAR_ITEMS })

export const refreshItems = () => ({ type: REFRESH_ITEMS })

// * PROMISES
// const thing = () => {
//   return new Promise((resolve, reject) => {
//     console.log('Promise timer started.')
//     setTimeout(() => {
//       resolve(true)
//     }, 3000)
//   })
// }

// * THUNKS
// export const generatePlanet = () => {
//   return async dispatch => {
//     const thingy = await thing()
//     console.log(thingy)
//   }
// }
