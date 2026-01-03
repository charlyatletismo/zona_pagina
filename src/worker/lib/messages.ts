const ES = 'es';
const EN = 'en';

export const appendToMessage = (baseMessage: Record<string, string>, appendMessage: string) => {
  // This function appends the same message to all language versions of a base message
  // and returns a new message object
  // It only applies for messages that ends with $APPEND in their keys
  return {
    [ES]: baseMessage[ES] + appendMessage,
    [EN]: baseMessage[EN] + appendMessage,
  }
}

export const M = {
  // -------------------------- GENERIC --------------------------
  UNAUTHORIZED: {
    [ES]: "No autorizado",
    [EN]: "Unauthorized"
  },
  INTERNAL_SERVER_ERROR: {
    [ES]: "Error interno del servidor",
    [EN]: "Internal server error"
  },
  FORBIDDEN: {
    [ES]: "Prohibido. Debe iniciar sesión primero.",
    [EN]: "Forbidden. Must be logged in first."
  },

  // -------------------------- AUTH --------------------------
  AUTH_USER_ID_REQUIRED: {
    [ES]: "El ID de usuario es obligatorio",
    [EN]: "User ID is required"
  },
  AUTH_PHONE_REQUIRED: {
    [ES]: "El número de teléfono es obligatorio",
    [EN]: "Phone number is required"
  },
  // AUTH_EMAIL_REQUIRED: {
  //   [ES]: "El correo electrónico es obligatorio",
  //   [EN]: "Email is required"
  // },
  AUTH_FAILED_SENDING_WHATSAPP: {
    [ES]: "Error al enviar el código de verificación por WhatsApp",
    [EN]: "Failed to send verification code via WhatsApp"
  },
  // AUTH_FAILED_SENDING_EMAIL: {
  //   [ES]: "Error al enviar el código de verificación por correo electrónico",
  //   [EN]: "Failed to send verification code via email"
  // },
  AUTH_CODE_SENT: {
    [ES]: "Código de verificación enviado",
    [EN]: "Verification code sent"
  },
  AUTH_INVALID_CODE: {
    [ES]: "Código de verificación inválido",
    [EN]: "Invalid verification code"
  },
  AUTH_CODE_EXPIRED: {
    [ES]: "El código de verificación ha expirado",
    [EN]: "Verification code has expired"
  },
  AUTH_TOO_MANY_ATTEMPTS: {
    [ES]: "Demasiados intentos fallidos. Por favor, solicita un nuevo código.",
    [EN]: "Too many failed attempts. Please request a new code."
  },

  // -------------------------- USERS --------------------------
  USER_NOT_FOUND: {
    [ES]: "Usuario no encontrado",
    [EN]: "User not found"
  },
  USER_ALREADY_EXISTS: {
    [ES]: "El usuario ya existe",
    [EN]: "User already exists"
  },
  USER_DATE_OF_BIRTH_NOT_SET: {
    [ES]: "La fecha de nacimiento del usuario no está establecida",
    [EN]: "User date of birth not set"
  },
  USER_SHIRT_SIZE_NOT_SET: {
    [ES]: "La talla de remera del usuario no está establecida",
    [EN]: "User shirt size not set"
  },

  // -------------------------- SPORTING EVENTS --------------------------
  SPORTING_EVENT_NOT_FOUND: {
    [ES]: "Evento deportivo no encontrado",
    [EN]: "Sporting event not found"
  },
  SPORTING_EVENT_FEE_NOT_SET: {
    [ES]: "La tarifa del evento deportivo no está establecida",
    [EN]: "Sporting event fee is not set"
  },
  SPORTING_EVENT_ALREADY_REGISTERED: {
    [ES]: "El usuario ya está registrado en este evento deportivo",
    [EN]: "User already registered in this sporting event"
  },
  SPORTING_EVENT_USER_UNQUALIFIED_FOR_ANY_CATEGORY: {
    [ES]: "El usuario no califica para ninguna categoría del evento deportivo",
    [EN]: "User unqualified for any category in the sporting event"
  },
  SPORTING_EVENT_USER_QUALIFIES_FOR_MULTIPLE_CATEGORIES_$APPEND: {
    [ES]: "El usuario califica para múltiples categorías del evento deportivo. Contacta al organizador. Categorías calificadas: ",
    [EN]: "User qualifies for multiple categories in the sporting event. Contact organizer. Categories qualified for: "
  },

  // -------------------------- ATHLETE CATEGORY TEMPLATES --------------------------
  ATHLETE_CATEGORY_TEMPLATE_NOT_FOUND: {
    [ES]: "Plantilla de categoría de atleta no encontrada",
    [EN]: "Athlete category template not found"
  },
  ATHLETE_CATEGORY_TEMPLATE_REQUIRED_BASE_NAME_MISSING: {
    [ES]: "El nombre base es obligatorio en la plantilla de categoría de atleta",
    [EN]: "Base name is required in athlete category template"
  },
  ATHLETE_CATEGORY_TEMPLATE_ERROR_CREATING: {
    [ES]: "Error al crear la plantilla de categoría de atleta",
    [EN]: "Error creating athlete category template"
  },
}
