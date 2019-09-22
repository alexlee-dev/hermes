import { addCash, removeCash } from './user'
import { removeItem } from './world'
import { createETA, createDiffDuration } from '../../util/main'
import moment from 'moment'

// * ACTION TYPES
const REMOVE_CARGO = 'REMOVE_CARGO'
const REPLACE_SHIP = 'REPLACE_SHIP'
const SET_DESTINATION = 'SET_DESTINATION'
const SET_ETA = 'SET_ETA'
const SET_SHIP_LOCATION = 'SET_SHIP_LOCATION'
const SET_SHIP_TRAVELING = 'SET_SHIP_TRAVELING'
const SET_TRIP_DURATION = 'SET_TRIP_DURATION'
const STORE_CARGO = 'STORE_CARGO'

// * ACTION GENERATORS

/**
 * Removes an item from the ship cargo.
 * @param {object} item Item to remove.
 */
export const removeCargo = item => ({
  type: REMOVE_CARGO,
  payload: {
    item
  }
})

/**
 * Replaces the entire Ship.
 * @param {Object} ship Ship object from Redux store.
 */
export const replaceShip = ship => ({ type: REPLACE_SHIP, payload: { ship } })

/**
 * Sets the ship's destination.
 * @param {object} destination Destination for the ship.
 */
export const setDestination = destination => ({
  type: SET_DESTINATION,
  payload: { destination }
})

/**
 * Sets an ETA in Unix MIllisecond Timestamp for the ship.
 * @param {string} eta ETA in Unix Millisecond Timestamp.
 */
export const setETA = eta => ({
  type: SET_ETA,
  payload: { eta }
})

/**
 * Sets the ship's location.
 * @param {object} location Location object.
 */
export const setShipLocation = location => ({
  type: SET_SHIP_LOCATION,
  payload: { location }
})

/**
 * Sets if the ship is traveling or not.
 * @param {boolean} isShipTraveling Is the ship traveling?
 */
export const setShipTraveling = isShipTraveling => ({
  type: SET_SHIP_TRAVELING,
  payload: { isShipTraveling }
})

/**
 * Sets the trip duration.
 * @param {Moment Duration} tripDuration Moment duration.
 */
export const setTripDuration = tripDuration => ({
  type: SET_TRIP_DURATION,
  payload: { tripDuration }
})

/**
 * Stores an item in the ship's cargo.
 * @param {object} item Item to store.
 * @param {number} quantity Quantity of the item to store.
 */
export const storeCargo = (item, quantity) => ({
  type: STORE_CARGO,
  payload: {
    item,
    quantity
  }
})

// * PROMISES

// * THUNKS
/**
 * The logic for the travel timer.
 * @param {object} ship Ship object
 * @param {function} setTimeLeft State function to set the time left.
 * @param {function} setTripPercent State function to set the trip percent.
 * @param {function} handleTimerStopped What to do when the timer stops.
 */
export const travelTimerLogic = (ship, setTimeLeft, setTripPercent) => (
  dispatch,
  getState
) => {
  if (ship.isShipTraveling) {
    const travelTimer = setInterval(() => {
      const diffDuration = createDiffDuration(ship.destination.eta)
      const tripDuration = moment.duration(getState().ship.tripDuration)
      const difference = tripDuration.clone().subtract(diffDuration)
      const percent = Math.floor(
        (difference.asMilliseconds() / tripDuration.asMilliseconds()) * 100
      )

      diffDuration.subtract(1, 'second')
      setTripPercent(percent)

      if (
        diffDuration.asMilliseconds() === 0 ||
        diffDuration.asMilliseconds() < 0
      ) {
        clearInterval(travelTimer)
        dispatch(landShip(ship))
        setTripPercent(0)
      }

      setTimeLeft(diffDuration)
    }, 1000)
  }
}

/**
 * Sets the ship to be traveling, sets the destination, and sets the ETA.
 * @param {object} destination Destination object.
 * @param {object} ship Ship object.
 */
export const departShip = (destination, ship) => dispatch => {
  // * set isShipTraveling to true
  dispatch(setShipTraveling(true))
  // * set destination
  dispatch(setDestination(destination))
  // * set ETA
  const eta = createETA(destination, ship)
  dispatch(setETA(eta.format('x')))
  // * set Trip Duration
  const tripDuration = createDiffDuration(eta)
  dispatch(setTripDuration(tripDuration))
}

/**
 * If the ship is carrying items to sell, will sell those items if necessary. Removes items from cargo if needed. Sets the ship location, destination, and isShipTraveling.
 * @param {object} ship Ship object.
 */
export const landShip = ship => dispatch => {
  const { cargo, destination } = ship
  const sellableItems = cargo.items.filter(
    item => item.destination.value === destination.value
  )
  let profit = 0
  sellableItems.forEach(item => {
    const { quantity, value } = item
    const itemProfit = quantity * value
    profit += itemProfit
  })
  dispatch(addCash(profit))
  sellableItems.forEach(item => {
    dispatch(removeCargo(item))
  })
  dispatch(
    setShipLocation({ name: destination.name, value: destination.value })
  )
  dispatch(setDestination(null))
  dispatch(setTripDuration(null))
  dispatch(setShipTraveling(false))
}

/**
 * Removes cash from the user, stores the cargo in the ship cargo, and removes the item from the planet.
 * @param {object} item Item object.
 * @param {number} quantity Quantity of the item.
 */
export const purchaseCargo = (item, quantity) => dispatch => {
  // * dispatch an action to buy the items with the user's cash
  dispatch(removeCash(item.price * quantity))
  // * dispatch an action to store the item in ship cargo
  dispatch(storeCargo(item, quantity))
  // * dispatch an action to remove the item from the list of stored items on this planet
  dispatch(removeItem(item, quantity))
}

export const instantTravel = destination => dispatch => {
  dispatch(setShipLocation({ name: destination.name }))
}
