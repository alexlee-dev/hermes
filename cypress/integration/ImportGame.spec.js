import { setMockState } from '../fixtures/default'

describe('Import Game', () => {
  beforeEach(() => {
    setMockState()
    cy.visit('http://localhost:3000')
  })

  it('Should import the game state from a JSON file.', () => {
    cy.contains('Import Game')
      .click()
      .then(() => {
        expect(localStorage.getItem('importedGame')).to.equal('true')
      })
  })
})
