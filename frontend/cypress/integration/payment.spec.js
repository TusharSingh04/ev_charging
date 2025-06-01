describe('Payment Flow', () => {
  beforeEach(() => {
    // Mock authentication and booking
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }))
      win.localStorage.setItem('currentBooking', JSON.stringify({
        id: 1,
        stationId: 1,
        startTime: new Date().toISOString(),
        duration: 60
      }))
    })
    cy.visit('/payment')
  })

  it('should display payment form', () => {
    cy.get('.payment-form').should('be.visible')
    cy.get('#cardNumber').should('exist')
    cy.get('#expiryDate').should('exist')
    cy.get('#cvv').should('exist')
  })

  it('should show validation errors for invalid card details', () => {
    cy.get('#cardNumber').type('1234')
    cy.get('#expiryDate').type('12/25')
    cy.get('#cvv').type('123')
    cy.get('.pay-btn').click()
    cy.get('.validation-error').should('be.visible')
  })

  it('should show payment summary', () => {
    cy.get('.payment-summary').should('be.visible')
    cy.get('.booking-details').should('exist')
    cy.get('.total-amount').should('exist')
  })

  it('should navigate to confirmation page after successful payment', () => {
    // Mock successful payment
    cy.intercept('POST', '/api/payments', {
      statusCode: 200,
      body: { success: true, transactionId: '123456' }
    }).as('paymentRequest')

    cy.get('#cardNumber').type('4242424242424242')
    cy.get('#expiryDate').type('12/25')
    cy.get('#cvv').type('123')
    cy.get('.pay-btn').click()

    cy.wait('@paymentRequest')
    cy.url().should('include', '/confirmation')
  })
}) 