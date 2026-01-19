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

  // -------------------------- SETTINGS --------------------------
  SETTINGS_PROFILE_UPDATED: {
    [ES]: "Perfil actualizado correctamente",
    [EN]: "Profile updated successfully"
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
  USERS_UNAVAILABLE: {
    [ES]: "Lista de usuarios no disponible",
    [EN]: "Users list unavailable"
  },
  USER_NOT_FOUND_OR_CANNOT_CHANGE_ADMIN_ROLE: {
    [ES]: "Usuario no encontrado o no se puede cambiar el rol de administrador",
    [EN]: "User not found or cannot change admin role"
  },
  USER_ROLE_UPDATED_SUCCESSFULLY: {
    [ES]: "Rol de usuario actualizado correctamente",
    [EN]: "User role updated successfully"
  },
  USER_NOT_FOUND_OR_UNAUTHORIZED: {
    [ES]: "Usuario no encontrado o no autorizado",
    [EN]: "User not found or unauthorized"
  },
  USER_PROFILE_UPDATED_SUCCESSFULLY: {
    [ES]: "Perfil de usuario actualizado correctamente",
    [EN]: "User profile updated successfully"
  },
  USER_CREATED_SUCCESSFULLY: {
    [ES]: "Usuario creado correctamente",
    [EN]: "User created successfully"
  },
  USER_INVALID_DATA: {
    [ES]: "Datos de usuario inválidos",
    [EN]: "Invalid user data"
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
  SPORTING_EVENT_UPDATED_SUCCESSFULLY: {
    [ES]: "Evento deportivo actualizado correctamente",
    [EN]: "Sporting event updated successfully"
  },
  SPORTING_EVENT_CREATED_SUCCESSFULLY: {
    [ES]: "Evento deportivo creado correctamente",
    [EN]: "Sporting event created successfully"
  },
  SPORTING_EVENT_DELETED_SUCCESSFULLY: {
    [ES]: "Evento deportivo eliminado correctamente",
    [EN]: "Sporting event deleted successfully"
  },
  SPORTING_EVENT_MISSING_REQUIRED_FIELDS: {
    [ES]: "Faltan campos obligatorios en el evento deportivo",
    [EN]: "Missing required fields in sporting event"
  },
  SPORTING_EVENT_CIRCUIT_ID_REQUIRED: {
    [ES]: "Se requiere el ID del circuito del evento deportivo",
    [EN]: "Sporting event circuit ID required"
  },
  SPORTING_EVENT_CIRCUIT_INVALID_DATA: {
    [ES]: "Los datos del circuito del evento deportivo no son válidos",
    [EN]: "Invalid sporting event circuit data"
  },
  SPORTING_EVENT_SCHEDULE_INVALID_DATA: {
    [ES]: "Los datos del cronograma del evento deportivo no son válidos",
    [EN]: "Invalid sporting event schedule data"
  },
  SPORTING_EVENT_CLOTHING_INVALID_DATA: {
    [ES]: "La ropa del evento deportivo no es válida",
    [EN]: "Invalid sporting event clothing data"
  },
  SPORTING_EVENT_ATHLETE_CATEGORY_INVALID_DATA: {
    [ES]: "Los datos de la categoría de atleta del evento deportivo no son válidos",
    [EN]: "Invalid sporting event athlete category data"
  },


  // -------------------------- SPORTING EVENT REGISTRATIONS --------------------------
  SPORTING_EVENT_REGISTRATION_NOT_FOUND: {
    [ES]: "Registro de evento deportivo no encontrado",
    [EN]: "Sporting event registration not found"
  },
  SPORTING_EVENT_REGISTRATION_PAYMENT_MISSING_REQUIRED_FIELDS: {
    [ES]: "Faltan campos obligatorios en el pago del registro del evento deportivo",
    [EN]: "Missing required fields in sporting event registration payment"
  },
  SPORTING_EVENT_REGISTRATION_CREATED_SUCCESSFULLY: {
    [ES]: "Registro del evento deportivo creado con éxito",
    [EN]: "Sporting event registration created successfully"
  },
  SPORTING_EVENT_REGISTRATION_PAYMENT_SUCCESSFUL: {
    [ES]: "Pago del registro del evento deportivo realizado con éxito",
    [EN]: "Sporting event registration payment successful"
  },

  // -------------------------- LOCATIONS --------------------------
  LOCATION_NOT_FOUND: {
    [ES]: "Ubicación no encontrada",
    [EN]: "Location not found"
  },
  LOCATION_ADDED_SUCCESSFULLY: {
    [ES]: "Ubicación agregada correctamente",
    [EN]: "Location added successfully"
  },
  LOCATION_UPDATED_SUCCESSFULLY: {
    [ES]: "Ubicación actualizada correctamente",
    [EN]: "Location updated successfully"
  },
  LOCATION_DELETED_SUCCESSFULLY: {
    [ES]: "Ubicación eliminada correctamente",
    [EN]: "Location deleted successfully"
  },

  // -------------------------- TRAINING TEAMS --------------------------
  TRAINING_TEAM_CREATED_SUCCESSFULLY: {
    [ES]: "Equipo de entrenamiento creado correctamente",
    [EN]: "Training team created successfully"
  },
  TRAINING_TEAM_UPDATED_SUCCESSFULLY: {
    [ES]: "Equipo de entrenamiento actualizado correctamente",
    [EN]: "Training team updated successfully"
  },
}
