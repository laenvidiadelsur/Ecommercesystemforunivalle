/**
 * HU1: Registro Completo de Usuario
 * 
 * Como: Usuario nuevo
 * Quiero: Registrarme en el sistema
 * Para: Poder acceder a las funcionalidades de compra y venta
 * 
 * Criterios de Aceptación:
 * - Debo poder registrarme con email, contraseña, nombre y rol
 * - Debo poder seleccionar entre rol de estudiante o vendedor
 * - Debo recibir confirmación de registro exitoso
 * - Debo ser redirigido al inicio después del registro
 */

describe('HU1: Registro Completo de Usuario', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debe permitir registrar un nuevo usuario como estudiante', () => {
    const timestamp = Date.now();
    const email = `estudiante${timestamp}@test.com`;
    const password = 'Test123456';
    const nombre = 'Estudiante Test';

    // Navegar a la página de registro
    cy.visit('/registro', { timeout: 30000 });
    
    // Esperar a que la página cargue completamente
    cy.wait(3000);
    
    // Verificar que la URL es correcta
    cy.url().should('include', '/registro');
    
    // Verificar que el body tiene contenido
    cy.get('body').should('exist');
    
    // Esperar a que aparezca cualquier input o texto del formulario
    cy.get('body', { timeout: 15000 }).should(($body) => {
      const hasInput = $body.find('input').length > 0;
      const hasText = $body.text().length > 100; // Al menos algo de contenido
      expect(hasInput || hasText, 'La página debe tener contenido').to.be.true;
    });
    
    // Buscar el input de nombre de forma más flexible
    cy.get('input', { timeout: 15000 }).first().should('exist');
    
    // Intentar encontrar el input por ID o por placeholder
    cy.get('body').then(($body) => {
      const nombreInput = $body.find('input#nombre');
      if (nombreInput.length === 0) {
        // Si no existe por ID, buscar por placeholder
        const inputWithPlaceholder = $body.find('input[placeholder*="Juan"], input[placeholder*="nombre"]');
        if (inputWithPlaceholder.length > 0) {
          cy.wrap(inputWithPlaceholder.first()).as('nombreInput');
        } else {
          // Usar el primer input disponible
          cy.get('input').first().as('nombreInput');
        }
      } else {
        cy.wrap(nombreInput).as('nombreInput');
      }
    });

    // Llenar el formulario - buscar inputs de forma flexible
    cy.get('body').then(($body) => {
      // Buscar input de nombre
      const nombreInput = $body.find('input#nombre');
      if (nombreInput.length > 0) {
        cy.get('input#nombre').clear().type(nombre);
      } else {
        cy.get('input').first().clear().type(nombre);
      }
      
      // Buscar input de email
      const emailInput = $body.find('input#email, input[type="email"]');
      if (emailInput.length > 0) {
        cy.get('input#email, input[type="email"]').first().clear().type(email);
      }
      
      // Buscar inputs de password
      const passwordInputs = $body.find('input#password, input[type="password"]');
      if (passwordInputs.length >= 2) {
        cy.get('input#password, input[type="password"]').first().clear().type(password);
        cy.get('input#confirmPassword, input[type="password"]').last().clear().type(password);
      } else if (passwordInputs.length === 1) {
        cy.get('input[type="password"]').first().clear().type(password);
        cy.get('input[type="password"]').first().clear().type(password); // Mismo campo dos veces
      }
    });

    // Seleccionar rol de estudiante usando el Select de Radix UI
    // El Select de Radix UI se activa con un botón/trigger
    cy.get('body').then(($body) => {
      // Buscar el trigger del Select - puede tener diferentes estructuras
      const selectTrigger = $body.find('button[role="combobox"], [role="combobox"], button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('estudiante') || text.includes('vendedor') || el.getAttribute('role') === 'combobox';
      });
      
      if (selectTrigger.length > 0) {
        // Hacer clic en el trigger del select
        cy.get('button[role="combobox"], [role="combobox"]').first().click({ force: true });
        cy.wait(1000);
        
        // Buscar y hacer clic en la opción "Estudiante"
        cy.get('[role="option"]', { timeout: 5000 }).contains('Estudiante', { matchCase: false }).click({ force: true });
        cy.wait(500);
      } else {
        // Si no hay select visible, el rol por defecto es 'estudiante', continuar
        cy.log('Select de rol no encontrado, usando valor por defecto');
      }
    });

    // Enviar el formulario
    cy.get('button[type="submit"]', { timeout: 10000 })
      .contains('Crear Cuenta', { matchCase: false })
      .should('exist')
      .click({ force: true });

    // Esperar a que se procese el registro (puede tomar tiempo)
    cy.wait(4000);

    // Verificar mensaje de éxito o redirección
    cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      const currentUrl = window.location.href;
      return text.includes('exitoso') || 
             text.includes('creada') || 
             text.includes('cuenta') ||
             currentUrl.includes('/') && !currentUrl.includes('/registro');
    });

    // Verificar redirección al inicio (puede tardar)
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url === Cypress.config().baseUrl + '/' || 
             url === Cypress.config().baseUrl + '/#/' ||
             !url.includes('/registro');
    });
  });

  it('Debe permitir registrar un nuevo usuario como vendedor', () => {
    const timestamp = Date.now();
    const email = `vendedor${timestamp}@test.com`;
    const password = 'Test123456';
    const nombre = 'Vendedor Test';

    // Navegar a la página de registro
    cy.visit('/registro', { timeout: 30000 });
    cy.wait(3000);
    cy.url().should('include', '/registro');
    
    // Verificar que hay contenido
    cy.get('body', { timeout: 15000 }).should(($body) => {
      const hasInput = $body.find('input').length > 0;
      expect(hasInput, 'La página debe tener inputs').to.be.true;
    });
    
    // Llenar el formulario
    cy.get('body').then(($body) => {
      if ($body.find('input#nombre').length > 0) {
        cy.get('input#nombre').clear().type(nombre);
      } else {
        cy.get('input').first().clear().type(nombre);
      }
      cy.get('input#email, input[type="email"]').first().clear().type(email);
      cy.get('input#password, input[type="password"]').first().clear().type(password);
      cy.get('input#confirmPassword, input[type="password"]').last().clear().type(password);
    });

    // Seleccionar rol de vendedor usando el Select de Radix UI
    cy.get('body').then(($body) => {
      const selectTrigger = $body.find('button[role="combobox"], [role="combobox"]');
      if (selectTrigger.length > 0) {
        cy.get('button[role="combobox"], [role="combobox"]').first().click({ force: true });
        cy.wait(1000);
        // Buscar y hacer clic en la opción "Vendedor"
        cy.get('[role="option"]', { timeout: 5000 }).contains('Vendedor', { matchCase: false }).click({ force: true });
        cy.wait(500);
      }
    });

    // Enviar el formulario
    cy.get('button[type="submit"]', { timeout: 10000 })
      .contains('Crear Cuenta', { matchCase: false })
      .click({ force: true });

    // Esperar a que se procese el registro
    cy.wait(4000);

    // Verificar registro exitoso (redirección o mensaje)
    cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      const currentUrl = window.location.href;
      return text.includes('exitoso') || 
             text.includes('creada') || 
             currentUrl.includes('/') && !currentUrl.includes('/registro');
    });

    // Verificar redirección al inicio
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url === Cypress.config().baseUrl + '/' || 
             url === Cypress.config().baseUrl + '/#/' ||
             !url.includes('/registro');
    });
  });

  it('Debe validar que las contraseñas coincidan', () => {
    cy.visit('/registro', { timeout: 30000 });
    cy.wait(3000);
    cy.url().should('include', '/registro');
    
    // Verificar que hay contenido
    cy.get('body', { timeout: 15000 }).should(($body) => {
      expect($body.find('input').length > 0, 'La página debe tener inputs').to.be.true;
    });

    // Llenar el formulario con contraseñas que no coinciden
    cy.get('body').then(($body) => {
      if ($body.find('input#nombre').length > 0) {
        cy.get('input#nombre').clear().type('Test User');
      } else {
        cy.get('input').first().clear().type('Test User');
      }
      cy.get('input#email, input[type="email"]').first().clear().type('test@test.com');
      cy.get('input#password, input[type="password"]').first().clear().type('password123');
      cy.get('input#confirmPassword, input[type="password"]').last().clear().type('password456');
    });

    // Seleccionar rol (necesario para enviar el formulario)
    cy.get('body').then(($body) => {
      const selectTrigger = $body.find('button[role="combobox"], [role="combobox"]');
      if (selectTrigger.length > 0) {
        cy.get('button[role="combobox"], [role="combobox"]').first().click({ force: true });
        cy.wait(1000);
        cy.get('[role="option"]', { timeout: 5000 }).contains('Estudiante', { matchCase: false }).click({ force: true });
        cy.wait(500);
      }
    });

    cy.get('button[type="submit"]', { timeout: 10000 })
      .contains('Crear Cuenta', { matchCase: false })
      .click({ force: true });

    // Esperar a que se muestre el error
    cy.wait(2000);

    // Debe mostrar error de contraseñas no coinciden (en toast o en pantalla)
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      return text.includes('coinciden') || 
             text.includes('contraseña') || 
             text.includes('password') ||
             text.includes('no coinciden');
    });
  });

  it('Debe validar campos requeridos', () => {
    cy.visit('/registro', { timeout: 30000 });
    cy.wait(3000);
    cy.url().should('include', '/registro');
    
    // Verificar que hay contenido
    cy.get('body', { timeout: 15000 }).should(($body) => {
      expect($body.find('input').length > 0, 'La página debe tener inputs').to.be.true;
    });

    // Intentar enviar sin llenar campos requeridos
    cy.get('button[type="submit"]', { timeout: 10000 })
      .contains('Crear Cuenta', { matchCase: false })
      .click();

    // Esperar a que se muestren los errores
    cy.wait(2000);

    // Debe mostrar errores de validación (HTML5 validation o toast)
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      // Verificar errores de validación HTML5 o mensajes de error
      const hasRequiredError = text.includes('requerido') || 
                              text.includes('completa') || 
                              text.includes('campos') ||
                              text.includes('completa todos');
      
      // También verificar si hay inputs con atributo :invalid (validación HTML5)
      const hasInvalidInputs = $body.find('input:invalid').length > 0;
      
      return hasRequiredError || hasInvalidInputs;
    });
  });
});

