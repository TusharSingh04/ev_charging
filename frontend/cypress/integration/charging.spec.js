describe('Charging Station Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }))
    })
    cy.visit('/dashboard')
  })

  it('should display charging stations on map', () => {
    // Wait for the map container to be visible first, with a longer timeout
    cy.get('.map-container', { timeout: 10000 }).should('exist')
    // Then wait for at least one station marker to be rendered, indicating data is loaded
    cy.get('.station-marker', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('should show station details on marker click', () => {
    cy.get('.station-marker').first().click()
    cy.get('.station-details').should('be.visible')
    cy.get('.station-name').should('exist')
    cy.get('.station-status').should('exist')
  })

  it('should filter stations by status', () => {
    cy.get('.filter-available').click()
    cy.get('.station-marker').should('have.length.at.least', 1)
    cy.get('.filter-occupied').click()
    cy.get('.station-marker').should('have.length.at.least', 1)
  })

  it('should show booking form for available station', () => {
    cy.get('.filter-available').click()
    cy.get('.station-marker').first().click()
    cy.get('.book-station-btn').click()
    cy.get('.booking-form').should('be.visible')
  })
}) 