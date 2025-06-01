describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate to login page', () => {
    cy.get('.login-btn').click()
    cy.url().should('include', '/login')
  })

  it('should navigate to register page', () => {
    cy.get('.register-btn').click()
    cy.url().should('include', '/register')
  })

  it('should show validation errors for invalid login', () => {
    cy.visit('/login')
    
    // Type invalid email and trigger blur
    cy.get('#email').type('invalid-email').blur()
    
    // Type invalid password and trigger blur
    cy.get('#password').type('12345').blur()
    
    // Get the login form and explicitly trigger the submit event
    cy.get('form.login-form').submit()
    
    // Assert that the specific validation error elements exist, are visible, and contain the correct text
    cy.get('#email + .validation-error').should('exist').and('be.visible').and('contain', 'Please enter a valid email address')
    cy.get('#password + .validation-error').should('exist').and('be.visible').and('contain', 'Password must be at least 6 characters long')
  })

  it('should toggle between login and register forms', () => {
    cy.visit('/login')
    cy.get('.toggle-form-text a').click()
    cy.url().should('include', '/register')
    cy.get('.toggle-form-text a').click()
    cy.url().should('include', '/login')
  })
}) 