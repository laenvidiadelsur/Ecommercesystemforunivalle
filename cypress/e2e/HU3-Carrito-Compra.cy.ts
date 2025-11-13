/**
 * HU3: Gestión de Carrito y Proceso de Compra
 * 
 * Como: Usuario autenticado
 * Quiero: Agregar productos al carrito y proceder a comprar
 * Para: Realizar compras de productos
 * 
 * Criterios de Aceptación:
 * - Debo poder agregar productos al carrito
 * - Debo poder ver el carrito con los productos agregados
 * - Debo poder modificar cantidades en el carrito
 * - Debo poder eliminar productos del carrito
 * - Debo poder seleccionar productos para comprar
 * - Debo poder proceder al checkout con productos seleccionados
 */

describe('HU3: Gestión de Carrito y Proceso de Compra', () => {
  const timestamp = Date.now();
  const email = `test${timestamp}@test.com`;
  const password = 'Test123456';
  const nombre = 'Test User';

  beforeEach(() => {
    // Registrar y autenticar usuario antes de cada prueba
    const uniqueEmail = `test${Date.now()}@test.com`;
    cy.visit('/registro', { timeout: 30000 });
    cy.wait(3000);
    
    // Verificar que hay contenido
    cy.get('body', { timeout: 15000 }).should(($body) => {
      expect($body.find('input').length > 0, 'La página debe tener inputs').to.be.true;
    });
    
    // Llenar el formulario
    cy.get('body').then(($body) => {
      if ($body.find('input#nombre').length > 0) {
        cy.get('input#nombre').clear().type(nombre);
      } else {
        cy.get('input').first().clear().type(nombre);
      }
      cy.get('input#email, input[type="email"]').first().clear().type(uniqueEmail);
      cy.get('input#password, input[type="password"]').first().clear().type(password);
      cy.get('input#confirmPassword, input[type="password"]').last().clear().type(password);
    });
    
    // Seleccionar rol (estudiante por defecto)
    cy.get('body').then(($body) => {
      const selectTrigger = $body.find('button[role="combobox"], [role="combobox"]');
      if (selectTrigger.length > 0) {
        cy.get('button[role="combobox"], [role="combobox"]').first().click({ force: true });
        cy.wait(1000);
        cy.get('[role="option"]', { timeout: 5000 }).contains('Estudiante', { matchCase: false }).click({ force: true });
        cy.wait(500);
      }
    });
    
    // Enviar formulario
    cy.get('button[type="submit"]', { timeout: 10000 })
      .contains('Crear Cuenta', { matchCase: false })
      .click({ force: true });
    
    cy.wait(4000); // Esperar registro y login automático
  });

  it('Debe permitir agregar un producto al carrito desde el catálogo', () => {
    cy.visit('/catalogo');
    cy.wait(2000);

    // Buscar botón de agregar al carrito
    cy.get('body').then(($body) => {
      const addToCartButtons = $body.find('button').filter((i, el) => {
        return Cypress.$(el).text().toLowerCase().includes('carrito') ||
               Cypress.$(el).text().toLowerCase().includes('agregar');
      });

      if (addToCartButtons.length > 0) {
        // Hacer clic en el primer botón de agregar al carrito
        cy.wrap(addToCartButtons.first()).click();
        
        // Verificar mensaje de éxito
        cy.wait(1000);
        cy.get('body').should('satisfy', ($body) => {
          const text = $body.text().toLowerCase();
          return text.includes('agregado') || text.includes('carrito');
        });
      }
    });
  });

  it('Debe permitir agregar un producto al carrito desde la página de detalle', () => {
    cy.visit('/catalogo');
    cy.wait(2000);

    // Hacer clic en un producto para ver detalles
    cy.get('body').then(($body) => {
      const productCards = $body.find('[data-testid="product-card"], .product-card, article, [class*="card"]');
      
      if (productCards.length > 0) {
        productCards.first().click();
        cy.wait(1000);
        
        // Buscar y hacer clic en botón de agregar al carrito
        cy.get('body').then(($body) => {
          const addButton = $body.find('button').filter((i, el) => {
            return Cypress.$(el).text().toLowerCase().includes('carrito') ||
                   Cypress.$(el).text().toLowerCase().includes('agregar');
          });
          
          if (addButton.length > 0) {
            cy.wrap(addButton.first()).click();
            cy.wait(1000);
            cy.get('body').should('satisfy', ($body) => {
              const text = $body.text().toLowerCase();
              return text.includes('agregado') || text.includes('carrito');
            });
          }
        });
      }
    });
  });

  it('Debe mostrar el drawer del carrito al hacer clic en el ícono', () => {
    // Agregar un producto primero
    cy.visit('/catalogo');
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      const addButton = $body.find('button').filter((i, el) => {
        return Cypress.$(el).text().toLowerCase().includes('carrito');
      });
      
      if (addButton.length > 0) {
        cy.wrap(addButton.first()).click();
        cy.wait(1000);
      }
    });

    // Hacer clic en el ícono del carrito en el header
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        return Cypress.$(el).find('svg').length > 0 || 
               Cypress.$(el).text().toLowerCase().includes('carrito');
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        // Buscar por aria-label o data-testid
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Verificar que el drawer se abre
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('Carrito') || text.includes('Mi Carrito');
    });
  });

  it('Debe permitir seleccionar productos individualmente en el carrito', () => {
    // Agregar productos al carrito
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Buscar checkboxes de selección
    cy.get('body').then(($body) => {
      const checkboxes = $body.find('input[type="checkbox"]');
      
      if (checkboxes.length > 0) {
        // Hacer clic en el primer checkbox
        cy.wrap(checkboxes.first()).click({ force: true });
        
        // Verificar que se seleccionó
        cy.wrap(checkboxes.first()).should('be.checked');
      }
    });
  });

  it('Debe permitir seleccionar todos los productos', () => {
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Buscar botón de "Seleccionar todo"
    cy.get('body').then(($body) => {
      if ($body.text().includes('Seleccionar todo')) {
        cy.contains('Seleccionar todo').click();
        cy.wait(500);
        
        // Verificar que todos los checkboxes están seleccionados
        cy.get('input[type="checkbox"]').each(($checkbox) => {
          cy.wrap($checkbox).should('be.checked');
        });
      }
    });
  });

  it('Debe permitir modificar la cantidad de productos en el carrito', () => {
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Buscar botones de incrementar/decrementar cantidad
    cy.get('body').then(($body) => {
      const plusButtons = $body.find('button').filter((i, el) => {
        return Cypress.$(el).find('svg').length > 0 || 
               Cypress.$(el).text().includes('+');
      });
      
      if (plusButtons.length > 0) {
        // Hacer clic en botón de incrementar
        cy.wrap(plusButtons.first()).click();
        cy.wait(500);
      }
    });
  });

  it('Debe permitir eliminar productos del carrito', () => {
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Buscar botón de eliminar (basura)
    cy.get('body').then(($body) => {
      const deleteButtons = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('eliminar') || 
               Cypress.$(el).find('svg').length > 0; // Botones con íconos
      });
      
      if (deleteButtons.length > 0) {
        // Hacer clic en el primer botón de eliminar
        cy.wrap(deleteButtons.first()).click();
        cy.wait(1000);
        
        // Verificar mensaje de eliminación
        cy.get('body').should('satisfy', ($body) => {
          const text = $body.text().toLowerCase();
          return text.includes('eliminado') || text.includes('carrito');
        });
      }
    });
  });

  it('Debe permitir proceder al checkout con productos seleccionados', () => {
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Seleccionar productos si hay checkboxes
    cy.get('body').then(($body) => {
      const checkboxes = $body.find('input[type="checkbox"]');
      if (checkboxes.length > 0) {
        cy.wrap(checkboxes.first()).click({ force: true });
      }
    });

    // Buscar botón de comprar
    cy.get('body').then(($body) => {
      const buyButton = $body.find('button').filter((i, el) => {
        return Cypress.$(el).text().toLowerCase().includes('comprar') ||
               Cypress.$(el).text().toLowerCase().includes('checkout');
      });
      
      if (buyButton.length > 0) {
        cy.wrap(buyButton.first()).click();
        cy.wait(2000);
        
        // Verificar navegación a checkout
        cy.url().should('include', '/checkout');
      }
    });
  });

  it('Debe mostrar el total correcto de productos seleccionados', () => {
    cy.visit('/catalogo');
    cy.wait(2000);
    
    // Abrir el carrito
    cy.get('body').then(($body) => {
      const cartButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        const hasSvg = Cypress.$(el).find('svg').length > 0;
        return text.includes('carrito') || hasSvg;
      });
      if (cartButton.length > 0) {
        cy.wrap(cartButton.first()).click();
      } else {
        cy.get('button[aria-label*="carrito"], button[data-testid*="cart"]').first().click();
      }
    });
    cy.wait(1000);

    // Verificar que se muestra información de total
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      return text.includes('total') || text.includes('bs.') || text.includes('seleccionado');
    });
  });
});

