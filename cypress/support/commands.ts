/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new user
       * @example cy.register('test@example.com', 'password123', 'Test User', 'estudiante')
       */
      register(email: string, password: string, nombre: string, rol?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[name="email"]').type(email);
  cy.get('input[type="password"], input[name="password"]').type(password);
  cy.get('button[type="submit"]').contains('Iniciar Sesión').click();
  cy.wait(2000); // Wait for login to complete
});

Cypress.Commands.add('register', (email: string, password: string, nombre: string, rol: string = 'estudiante') => {
  cy.visit('/registro');
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').first().type(password);
  cy.get('input[name="confirmPassword"], input[type="password"]').last().type(password);
  cy.get('input[name="nombre"], input[placeholder*="nombre" i]').type(nombre);
  
  if (rol) {
    cy.get('select[name="rol"], button').contains(rol).click();
  }
  
  cy.get('button[type="submit"]').contains('Crear Cuenta').click();
  cy.wait(2000); // Wait for registration to complete
});

export {};

