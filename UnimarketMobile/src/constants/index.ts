// Univalle Brand Colors and App Constants

export const COLORS = {
  // Unimarket Web Accent (morado formal)
  primary: '#522b46',        // Morado principal (botones, acentos)
  secondary: '#6b4e74',      // Morado secundario (chips, etiquetas)
  background: '#FFFFFF',     // Fondo principal
  surface: '#FFFFFF',        // Superficie de tarjetas
  textPrimary: '#333333',    // Texto principal
  textSecondary: '#666666',  // Texto secundario
  text: '#333333',           // Alias para compatibilidad
  
  // Status Colors
  success: '#2e7d32',        // Éxito sobrio
  warning: '#b26a00',        // Advertencia sobria
  error: '#c62828',          // Error sobrio
  info: '#2f5d9f',           // Información
  
  // UI Colors
  border: '#e4e4e7',         // Bordes sutiles
  disabled: '#CCCCCC',       // Elementos deshabilitados
  placeholder: '#999999',    // Placeholder text
  
  // Background Variants
  backgroundLight: '#F8F9FA',     // Fondo claro
  backgroundGray: '#F5F5F5',      // Fondo gris
  backgroundDark: '#E9ECEF',      // Fondo oscuro
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',      // Overlay negro
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Overlay ligero
  
  // Shadow Colors
  shadow: '#000000',            // Sombra
  shadowLight: 'rgba(0, 0, 0, 0.1)', // Sombra ligera
} as const;

export const SPACING = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
} as const;

export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,   // 12px
    sm: 14,   // 14px
    md: 16,   // 16px
    lg: 18,   // 18px
    xl: 20,   // 20px
    xxl: 24,  // 24px
    xxxl: 32, // 32px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
} as const;

export const LAYOUT = {
  // Screen dimensions
  screenPadding: SPACING.md,
  
  // Component dimensions
  buttonHeight: 44,        // Altura mínima para accesibilidad táctil
  inputHeight: 48,         // Altura de inputs
  cardBorderRadius: 12,    // Radio de bordes de tarjetas
  buttonBorderRadius: 8,   // Radio de bordes de botones
  
  // Touch targets
  minTouchSize: 44,        // Tamaño mínimo de toque (iOS/Android guidelines)
  
  // Shadows
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
  
  // Animation durations
  animationDuration: {
    fast: 150,    // 150ms
    normal: 300,  // 300ms
    slow: 500,    // 500ms
  },
} as const;

export const API = {
  // Pagination
  defaultLimit: 20,
  maxLimit: 100,
  
  // Cache times (in milliseconds)
  cacheTime: 5 * 60 * 1000,     // 5 minutes
  staleTime: 2 * 60 * 1000,     // 2 minutes
  
  // Retry configuration
  retryCount: 3,
  retryDelay: 1000,              // 1 second
} as const;

export const STORAGE = {
  // Storage keys
  authToken: '@unimarket:auth_token',
  refreshToken: '@unimarket:refresh_token',
  userProfile: '@unimarket:user_profile',
  cartItems: '@unimarket:cart_items',
  appSettings: '@unimarket:app_settings',
} as const;

export const VALIDATION = {
  // Email validation
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Password validation
  minPasswordLength: 6,
  
  // Phone validation (Colombian format)
  phoneRegex: /^\+?57\s?[1-9]\d{9}$|^\+?\d{10,15}$/,
  
  // Carnet validation (Univalle format)
  carnetRegex: /^\d{6,10}$/,
  
  // Price validation
  maxPrice: 99999999,
  minPrice: 0,
  
  // Stock validation
  maxStock: 9999,
  minStock: 0,
} as const;

export const MESSAGES = {
  // Error messages
  networkError: 'Error de conexión. Por favor verifica tu internet.',
  serverError: 'Error del servidor. Por favor intenta más tarde.',
  validationError: 'Por favor verifica los datos ingresados.',
  unauthorizedError: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  
  // Success messages
  loginSuccess: 'Bienvenido a Unimarket!',
  registerSuccess: 'Cuenta creada exitosamente.',
  orderSuccess: 'Orden creada exitosamente.',
  profileUpdateSuccess: 'Perfil actualizado exitosamente.',
  productAddedSuccess: 'Producto agregado exitosamente.',
  
  // Info messages
  emptyCart: 'Tu carrito está vacío.',
  emptyOrders: 'No tienes órdenes aún.',
  emptyProducts: 'No hay productos disponibles.',
  noResults: 'No se encontraron resultados.',
  
  // Loading messages
  loading: 'Cargando...',
  processing: 'Procesando...',
  uploading: 'Subiendo imagen...',
} as const;

export const CONFIG = {
  // App configuration
  appName: 'Unimarket Móvil',
  appVersion: '1.0.0',
  
  // API configuration
  timeout: 30000, // 30 seconds
  
  // Image configuration
  maxImageSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ['image/jpeg', 'image/jpg', 'image/png'],
  
  // Search configuration
  searchDebounceTime: 500, // 500ms
  
  // Cart configuration
  maxCartItems: 50,
  
  // Order configuration
  orderExpirationTime: 24 * 60 * 60 * 1000, // 24 hours
} as const;
