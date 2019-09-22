import * as d3 from 'd3'

const radius = 23
const fill = '#1976d2'
const fillHover = 'rgb(17, 82, 147)'

export const createSvg = (selector, height, width) =>
  d3
    .select(selector)
    .append('svg')
    .attr('height', height)
    .attr('width', width)

export const createSimulation = data =>
  d3
    .forceSimulation()
    .nodes(data)
    .stop()

export const modifyCursor = (selection, currentShipLocation) =>
  selection.attr('style', ({ name }) =>
    name !== currentShipLocation.name ? 'cursor: pointer' : 'cursor: default'
  )

const createCircle = (selection, height, width) =>
  selection
    .append('circle')
    .attr('r', radius)
    .attr('fill', fill)
    .attr('cx', ({ location }) => width / 2 + location.x * width)
    .attr('cy', ({ location }) => height / 2 - location.y * height)

export const createNodes = (svg, data, currentShipLocation, height, width) => {
  const selection = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'node-container')
    .attr('id', ({ name }) => name)

  modifyCursor(selection, currentShipLocation)
  createCircle(selection, height, width)

  return selection
}

export const createLinks = (svg, data, height, width) =>
  svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data)
    .enter()
    .append('line')
    .attr('stroke-width', 2)
    .attr(
      'x1',
      ({ source }) =>
        width / 2 +
        svg.select(`#${source}`).data()[0].location.x * width +
        radius
    )
    .attr(
      'y1',
      ({ source }) =>
        height / 2 + svg.select(`#${source}`).data()[0].location.y * height
    )
    .attr(
      'x2',
      ({ target }) =>
        width / 2 +
        svg.select(`#${target}`).data()[0].location.x * width -
        radius
    )
    .attr(
      'y2',
      ({ target }) =>
        height / 2 + svg.select(`#${target}`).data()[0].location.y * height
    )

export const createLabels = (svg, height, width) =>
  svg
    .selectAll('.node-container')
    .append('text')
    .text(({ name }) => name)
    .attr('x', ({ location }) => width / 2 + location.x * width - radius)
    .attr('y', ({ location }) => height / 2 + location.y * height + radius + 20)

export const createHomePlanetInd = (svg, planets, height, width) => {
  const homePlanet = planets.find(planet => planet.isHomePlanet === true)

  const selection = svg
    .select(`#${homePlanet.name}`)
    .append('text')
    .text('(Home Planet)')
    .attr('id', 'home-planet-ind')
    .style('font-size', '10px')
    .attr('x', ({ location }) => width / 2 + location.x * width - radius - 4)
    .attr('y', ({ location }) => height / 2 + location.y * height + radius + 40)

  return selection
}

export const createShipInd = (svg, ship, height, width) =>
  svg
    .select(`#${ship.location.name}`)
    .append('text')
    .text('(YOUR_SHIP)')
    .attr('id', 'ship-ind')
    .style('font-size', '10px')
    .attr('x', ({ location }) => width / 2 + location.x * width - radius - 8)
    .attr('y', ({ location }) => height / 2 + location.y * height - radius - 10)

export const addEventsToNodes = (
  svg,
  setDestination,
  setOpen,
  currentShipLocation
) => {
  svg.selectAll('.node-container').on('mouseover', function(planet) {
    // * Function has in scope: data, d3.event, d3.mouse(this), this

    if (planet.name !== currentShipLocation.name) {
      d3.select(this)
        .select('text')
        .style('font-size', '20px')
      d3.select(this)
        .select('circle')
        .attr('fill', fillHover)
    }
  })
  svg.selectAll('.node-container').on('mouseleave', function(planet) {
    d3.select(this)
      .select('circle')
      .attr('fill', fill)
    d3.select(this)
      .select('text')
      .style('font-size', '16px')
  })
  svg.selectAll('.node-container').on('click', function(planet) {
    if (planet.name !== currentShipLocation.name) {
      setDestination(planet)
      setOpen(true)
    }
  })
}

export const updateShipLocation = (
  currentShipLocation,
  setOpen,
  setDestination,
  height,
  width
) => {
  const svg = d3.select('svg')
  const destinationNode = svg.select(`#${currentShipLocation.name}`)

  svg
    .select(`#ship-ind`)
    .attr(
      'x',
      () =>
        width / 2 + destinationNode.data()[0].location.x * width - radius - 8
    )
    .attr(
      'y',
      () =>
        height / 2 + destinationNode.data()[0].location.y * height - radius - 10
    )

  // * Remove event listeners from nodes
  svg.selectAll('.node-container').on('mouseover', null)
  svg.selectAll('.node-container').on('mouseleave', null)
  svg.selectAll('.node-container').on('click', null)

  addEventsToNodes(svg, setDestination, setOpen, currentShipLocation)

  // * Update cursor stuff
  modifyCursor(svg.selectAll('.node-container'), currentShipLocation)
}

export const getHeight = selector =>
  d3.select(selector).property('clientHeight')

export const getWidth = selector => d3.select(selector).property('clientWidth')
