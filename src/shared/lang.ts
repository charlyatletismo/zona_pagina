const ES = 'es';
const EN = 'en';


export const RegistrationStatusDescriptions: {[key: string]: {[key: string]: string}} = {
  not_registered: {
    [ES]: "No inscripto",
    [EN]: "Not registered",
  },
  pending: {
    [ES]: "Pendiente de pago",
    [EN]: "Pending payment",
  },
  pending_category_set: {
    [ES]: "Pendiente de asignación de categoría",
    [EN]: "Pending category set",
  },
  partially_paid: {
    [ES]: "Parcialmente pagado",
    [EN]: "Partially paid",
  },
  paid: {
    [ES]: "Pagado",
    [EN]: "Paid",
  },
  cancelled: {
    [ES]: "Cancelado",
    [EN]: "Cancelled",
  },
};


export const SportingEventTypesEnumDescriptions: {[key: string]: {[key: string]: string}} = {
  marathon: {
    [ES]: "Maratón",
    [EN]: "Marathon",
  },
  half_marathon: {
    [ES]: "Media Maratón",
    [EN]: "Half Marathon",
  },
  duathlon: {
    [ES]: "Duatlón",
    [EN]: "Duathlon",
  },
  triathlon: {
    [ES]: "Triatlón",
    [EN]: "Triathlon",
  },
  trail: {
    [ES]: "Trail",
    [EN]: "Trail",
  },
  cycling: {
    [ES]: "Ciclismo",
    [EN]: "Cycling",
  },
  swimming: {
    [ES]: "Natación",
    [EN]: "Swimming",
  },
  other: {
    [ES]: "Otro",
    [EN]: "Other",
  },
};


export const TransactionPaymentMethodDesc: {[key: string]: {[key: string]: string}} = {
  cash: {
    [ES]: "Efectivo",
    [EN]: "Cash",
  },
  bank_transfer: {
    [ES]: "Transferencia bancaria",
    [EN]: "Bank transfer",
  },
  mercado_pago_payment: {
    [ES]: "Pago vía Mercado Pago",
    [EN]: "Payment via Mercado Pago",
  },
  other: {
    [ES]: "Otro",
    [EN]: "Other",
  },
};


export const TransactionStatusDesc: {[key: string]: {[key: string]: string}} = {
  pending: {
    [ES]: "Pendiente",
    [EN]: "Pending",
  },
  completed: {
    [ES]: "Completado",
    [EN]: "Completed",
  },
  cancelled: {
    [ES]: "Cancelado",
    [EN]: "Cancelled",
  },
  failed: {
    [ES]: "Fallido",
    [EN]: "Failed",
  }
};


export const TransactionTypeDesc: {[key: string]: {[key: string]: string}} = {
  inflow: {
    [ES]: "Ingreso",
    [EN]: "Inflow",
  },
  outflow: {
    [ES]: "Egreso",
    [EN]: "Outflow",
  },
};


export const TransactionCategoryDesc: {[key: string]: {[key: string]: string}} = {
  registration_payment: {
    [ES]: "Pago de inscripción",
    [EN]: "Registration payment",
  },
  registration_refund: {
    [ES]: "Reembolso de inscripción",
    [EN]: "Registration refund",
  },
  infrastructure: {
    [ES]: "Infraestructura",
    [EN]: "Infrastructure",
  },
  marketing: {
    [ES]: "Marketing",
    [EN]: "Marketing",
  },
  prizes: {
    [ES]: "Premios",
    [EN]: "Prizes",
  },
  clothing: {
    [ES]: "Indumentaria",
    [EN]: "Clothing",
  },
  permits: {
    [ES]: "Permisos / Licencias",
    [EN]: "Permits / Licenses",
  },
  equipment: {
    [ES]: "Equipamiento",
    [EN]: "Equipment",
  },
  sponsorship: {
    [ES]: "Sponsorship",
    [EN]: "Sponsorship",
  },
  partner_services: {
    [ES]: "Servicios de socios",
    [EN]: "Partner services",
  },
  other_inflow: {
    [ES]: "Otro (ingreso)",
    [EN]: "Other (inflow)",
  },
  other_outflow: {
    [ES]: "Otro (egreso)",
    [EN]: "Other (outflow)",
  },
};
