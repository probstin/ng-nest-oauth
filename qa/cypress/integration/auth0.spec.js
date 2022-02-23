describe('Auth0', function () {
    
    beforeEach(function () {
        cy.loginByAuth0Api(
            Cypress.env('auth0_username'),
            Cypress.env('auth0_password')
        )
    })

    it('shows onboarding', function () {        
        cy.contains('This is a public page').should('be.visible')
    })
})