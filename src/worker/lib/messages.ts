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
  SETTINGS_MANAGER_ID_TOO_SHORT: {
    [ES]: "El ID del gestor es demasiado corto",
    [EN]: "Manager ID is too short"
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
  USER_EMAIL_ALREADY_IN_USE: {
    [ES]: "El correo electrónico ya está en uso",
    [EN]: "Email already in use"
  },
  USER_PHONE_ALREADY_IN_USE: {
    [ES]: "El número de teléfono ya está en uso",
    [EN]: "Phone number already in use"
  },
  USER_DATE_OF_BIRTH_NOT_SET: {
    [ES]: "La fecha de nacimiento del usuario no está establecida",
    [EN]: "User date of birth not set"
  },
  USER_SHIRT_SIZE_NOT_SET: {
    [ES]: "La talla de remera del usuario no está establecida",
    [EN]: "User shirt size not set"
  },
  USER_BANNED: {
    [ES]: "Usuario baneado",
    [EN]: "User banned"
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
  USER_ID_UPDATED_SUCCESSFULLY: {
    [ES]: "ID de usuario actualizado correctamente",
    [EN]: "User ID updated successfully"
  },
  USER_CREATED_SUCCESSFULLY: {
    [ES]: "Usuario creado correctamente",
    [EN]: "User created successfully"
  },
  USER_INVALID_DATA: {
    [ES]: "Datos de usuario inválidos",
    [EN]: "Invalid user data"
  },
  USER_LOCATION_UPDATED_SUCCESSFULLY: {
    [ES]: "Ubicación del usuario actualizada correctamente",
    [EN]: "User location updated successfully"
  },
  USER_TRAINING_TEAM_UPDATED_SUCCESSFULLY: {
    [ES]: "Equipo de entrenamiento del usuario actualizado correctamente",
    [EN]: "User training team updated successfully"
  },
  USERS_MANAGEMENT_TRANSFER_SUCCESSFUL: {
    [ES]: "Gestión transferida correctamente",
    [EN]: "Management transferred successfully"
  },
  USERS_MANAGEMENT_REMOVAL_SUCCESSFUL: {
    [ES]: "Gestión removida correctamente",
    [EN]: "Management removed successfully"
  },
  USERS_CANNOT_CHANGE_ROLE_WITH_MANAGED_USERS: {
    [ES]: "No se puede cambiar el rol de un usuario que tiene usuarios a cargo. Por favor, reasigna o elimina a los usuarios a cargo primero.",
    [EN]: "Cannot change role of a user that has managed users. Please reassign or remove managed users first."
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
  SPORTING_EVENT_USER_ID_REQUIRED: {
    [ES]: "Se requiere el DNI del usuario a registrarse en el evento deportivo",
    [EN]: "User ID required to register for sporting event"
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
  SPORTING_EVENT_CLOTHING_UPDATED_SUCCESSFULLY: {
    [ES]: "Ropa del evento deportivo actualizada correctamente",
    [EN]: "Sporting event clothing updated successfully"
  },
  SPORTING_EVENT_PHOTO_UPDATED_SUCCESSFULLY: {
    [ES]: "Foto del evento deportivo actualizada correctamente",
    [EN]: "Sporting event photo updated successfully"
  },
  SPORTING_EVENT_PHOTO_REQUIRED: {
    [ES]: "La foto del evento deportivo es obligatoria",
    [EN]: "Sporting event photo is required"
  },
  SPORTING_EVENT_PHOTO_UPDATE_ERROR: {
    [ES]: "Error al actualizar la foto del evento deportivo",
    [EN]: "Error updating sporting event photo"
  },
  SPORTING_EVENT_PHOTO_NOT_FOUND: {
    [ES]: "Foto del evento deportivo no encontrada",
    [EN]: "Sporting event photo not found"
  },
  SPORTING_EVENT_PHOTO_DELETE_ERROR: {
    [ES]: "Error al eliminar la foto del evento deportivo",
    [EN]: "Error deleting sporting event photo"
  },
  SPORTING_EVENT_PHOTO_DELETED_SUCCESSFULLY: {
    [ES]: "Foto del evento deportivo eliminada correctamente",
    [EN]: "Sporting event photo deleted successfully"
  },


  // -------------------------- SPORTING EVENT REGISTRATIONS --------------------------
  SPORTING_EVENT_REGISTRATION_NOT_FOUND: {
    [ES]: "Inscripción al evento deportivo no encontrada",
    [EN]: "Sporting event registration not found"
  },
  SPORTING_EVENT_REGISTRATIONS_NOT_FOUND: {
    [ES]: "Inscripciones al evento deportivo no encontradas",
    [EN]: "Sporting event registrations not found"
  },
  SPORTING_EVENT_REGISTRATION_PAYMENT_MISSING_REQUIRED_FIELDS: {
    [ES]: "Faltan campos obligatorios en el pago de la inscripción del evento deportivo",
    [EN]: "Missing required fields in sporting event registration payment"
  },
  SPORTING_EVENT_REGISTRATION_CREATED_SUCCESSFULLY: {
    [ES]: "Inscripción del evento deportivo creada con éxito",
    [EN]: "Sporting event registration created successfully"
  },
  SPORTING_EVENT_REGISTRATION_PAYMENT_SUCCESSFUL: {
    [ES]: "Pago de la inscripción del evento deportivo realizado con éxito",
    [EN]: "Sporting event registration payment successful"
  },
  SPORTING_EVENT_REGISTRATION_MISSING_EVENT_ID: {
    [ES]: "La inscripción del evento deportivo no tiene un evento existente asociado",
    [EN]: "Sporting event registration does not have an associated existing event"
  },
  SPORTING_EVENT_REGISTRATION_ALREADY_PAID: {
    [ES]: "La inscripción del evento deportivo ya ha sido pagada",
    [EN]: "Sporting event registration has already been paid"
  },
  SPORTING_EVENT_REGISTRATION_NOT_STARTED: {
    [ES]: "La inscripción al evento deportivo aún no ha comenzado",
    [EN]: "Sporting event registration has not started yet"
  },
  SPORTING_EVENT_REGISTRATION_ENDED: {
    [ES]: "La inscripción al evento deportivo ha finalizado",
    [EN]: "Sporting event registration has ended"
  },
  SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR: {
    [ES]: "Error al procesar el pago de la inscripción del evento deportivo",
    [EN]: "Error processing sporting event registration payment"
  },
  SPORTING_EVENT_REGISTRATION_CANNOT_BE_DELETED: {
    [ES]: "La inscripción del evento deportivo no puede ser eliminada",
    [EN]: "Sporting event registration cannot be deleted"
  },
  SPORTING_EVENT_REGISTRATION_DELETED_SUCCESSFULLY: {
    [ES]: "Inscripción del evento deportivo eliminada correctamente",
    [EN]: "Sporting event registration deleted successfully"
  },
  SPORTING_EVENT_REGISTRATION_KIT_DELIVERY_STATUS_UPDATED_SUCCESSFULLY: {
    [ES]: "Estado de entrega del kit de la inscripción del evento deportivo actualizado correctamente",
    [EN]: "Sporting event registration kit delivery status updated successfully"
  },
  SPORTING_EVENT_REGISTRATION_IDS_REQUIRED: {
    [ES]: "Se requieren los IDs de las inscripciones del evento deportivo",
    [EN]: "Sporting event registration IDs required"
  },
  SPORTING_EVENT_REGISTRATION_ID_REQUIRED: {
    [ES]: "Se requiere el ID de la inscripción del evento deportivo",
    [EN]: "Sporting event registration ID required"
  },
  SPORTING_EVENT_REGISTRATION_DISCOUNT_INVALID: {
    [ES]: "Descuento inválido para las inscripciones del evento deportivo",
    [EN]: "Invalid discount for sporting event registrations"
  },
  SPORTING_EVENT_REGISTRATIONS_DISCOUNT_APPLIED_SUCCESSFULLY: {
    [ES]: "Descuento aplicado correctamente a las inscripciones del evento deportivo",
    [EN]: "Discount applied successfully to sporting event registrations"
  },
  SPORTING_EVENT_REGISTRATION_TRANSFERRED_SUCCESSFULLY: {
    [ES]: "Inscripción del evento deportivo transferida correctamente",
    [EN]: "Sporting event registration transferred successfully"
  },
  SPORTING_EVENT_REGISTRATION_CANNOT_BE_TRANSFERRED: {
    [ES]: "La inscripción del evento deportivo no puede ser transferida",
    [EN]: "Sporting event registration cannot be transferred"
  },
  SPORTING_EVENT_REGISTRATIONS_DISMISSED_PENDING_AMOUNTS_SUCCESSFULLY: {
    [ES]: "Montos pendientes de las inscripciones desestimados correctamente",
    [EN]: "Pending amounts of sporting event registrations dismissed successfully"
  },
  SPORTING_EVENT_REGISTRATIONS_CANCELLED_SUCCESSFULLY: {
    [ES]: "Inscripciones del evento deportivo canceladas correctamente",
    [EN]: "Sporting event registrations cancelled successfully"
  },
  SPORTING_EVENT_REGISTRATIONS_REACTIVATED_SUCCESSFULLY: {
    [ES]: "Inscripciones del evento deportivo reactivadas correctamente",
    [EN]: "Sporting event registrations reactivated successfully"
  },
  SPORTING_EVENT_REGISTRATION_TRANSFER_ONLY_PAID_ALLOWED: {
    [ES]: "Solo se permiten transferencias de inscripciones al evento deportivo que hayan sido pagadas",
    [EN]: "Only transfers of sporting event registrations that have been paid are allowed"
  },
  SPORTING_EVENT_BENEFICIARY_USER_ID_REQUIRED: {
    [ES]: "Se requiere el ID del usuario beneficiario para transferir la inscripción del evento deportivo",
    [EN]: "Beneficiary user ID required to transfer sporting event registration"
  },
  SPORTING_EVENT_BENEFICIARY_REGISTRATION_NOT_FOUND: {
    [ES]: "Inscripción del evento deportivo del beneficiario no encontrada",
    [EN]: "Beneficiary sporting event registration not found"
  },
  SPORTING_EVENT_BENEFICIARY_REGISTRATION_ALREADY_PAID: {
    [ES]: "La inscripción del evento deportivo del beneficiario ya ha sido pagada",
    [EN]: "Beneficiary sporting event registration has already been paid"
  },
  SPORTING_EVENT_BENEFICIARY_REGISTRATION_CANCELLED: {
    [ES]: "La inscripción del evento deportivo del beneficiario está cancelada",
    [EN]: "Beneficiary sporting event registration is cancelled"
  },
  

  // -------------------------- SPORTING EVENT TRANSACTIONS --------------------------
  SPORTING_EVENT_TRANSACTION_NOT_FOUND: {
    [ES]: "Transacción de evento deportivo no encontrada",
    [EN]: "Sporting event transaction not found"
  },
  SPORTING_EVENT_TRANSACTION_INVALID_DATA: {
    [ES]: "Datos de transacción de evento deportivo no válidos",
    [EN]: "Invalid sporting event transaction data"
  },
  SPORTING_EVENT_TRANSACTION_CREATED_SUCCESSFULLY: {
    [ES]: "Transacción de evento deportivo creada correctamente",
    [EN]: "Sporting event transaction created successfully"
  },
  SPORTING_EVENT_TRANSACTION_UPDATED_SUCCESSFULLY: {
    [ES]: "Transacción de evento deportivo actualizada correctamente",
    [EN]: "Sporting event transaction updated successfully"
  },
  SPORTING_EVENT_TRANSACTION_DELETED_SUCCESSFULLY: {
    [ES]: "Transacción de evento deportivo eliminada correctamente",
    [EN]: "Sporting event transaction deleted successfully"
  },


  // -------------------------- Chips --------------------------
  CHIPS_SUCCESS_CREATING: {
    [ES]: "Chips creados correctamente",
    [EN]: "Chips created successfully"
  },
  CHIPS_SUCCESS_UPDATING: {
    [ES]: "Chips actualizados correctamente",
    [EN]: "Chips updated successfully"
  },
  CHIPS_ERROR_UPDATING: {
    [ES]: "Error al actualizar los chips",
    [EN]: "Error updating chips"
  },
  CHIPS_NOT_FOUND: {
    [ES]: "Chips no encontrados",
    [EN]: "Chips not found"
  },
  CHIPS_SUCCESS_DELETING: {
    [ES]: "Chips eliminados correctamente",
    [EN]: "Chips deleted successfully"
  },
  CHIPS_INVALID_DATA: {
    [ES]: "Datos de chips inválidos",
    [EN]: "Invalid chips data"
  },
  CHIPS_OVERLAPPING: {
    [ES]: "Los chips se superponen con un rango existente",
    [EN]: "Chips overlap with an existing range"
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
  TRAINING_TEAM_DELETED_SUCCESSFULLY: {
    [ES]: "Equipo de entrenamiento eliminado correctamente",
    [EN]: "Training team deleted successfully"
  },
  TRAINING_TEAM_NOT_FOUND: {
    [ES]: "Equipo de entrenamiento no encontrado",
    [EN]: "Training team not found"
  },
}
