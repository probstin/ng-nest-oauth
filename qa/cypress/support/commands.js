import * as jwt from "jsonwebtoken";

Cypress.Commands.add('loginByAuth0Api', (username, password) => {

    cy.log(`Logging in as ${username}`);

    const client_id = Cypress.env('auth0_client_id');
    const audience = Cypress.env('auth0_audience');
    const scope = Cypress.env('auth0_scope');

    cy.request({
        method: 'POST',
        url: `https://${Cypress.env('auth0_domain')}/oauth/token`,
        body: {
            grant_type: 'password',
            username,
            password,
            audience,
            scope,
            client_id
        }
    }).then(({ body }) => {
        const access_token = body.access_token;
        const id_token = body.id_token;
        const claims = jwt.decode(access_token);
        const expiresAt = claims.exp * 1000;
        const iat = claims.iat * 1000;

        window.localStorage.setItem('id_token', id_token);
        window.localStorage.setItem('id_token_expires_at', iat);
        window.localStorage.setItem('id_token_claims_obj', claims);
        window.localStorage.setItem('expires_at', expiresAt);
        window.localStorage.setItem('access_token', access_token);
    });

    cy.visit('/');

})
