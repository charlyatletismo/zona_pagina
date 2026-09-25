export const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

/**
 * Validates a CUIT/CUIL check digit.
 * Expects the format XX-XXXXXXXX-X (format is checked separately by CUIT_REGEX).
 * 
 * La validación del cuit se saca de la página de constancia de monotributo
 * de ARCA (ex-AFIP)
 * 
 * - https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do
 *   - Mirar: ValidaCuit.js
 * 
 */
export const isValidCuit = (cuit: string): boolean => {
  const cuitNoHyphens = cuit.replace(/-/g, '');
  if (cuitNoHyphens.length !== 11 || isNaN(Number(cuitNoHyphens)) ) { return false; }

  const chars_1_2 = cuitNoHyphens.slice(0, 2);
  if ( !["20", "23", "24", "27", "30", "33", "34"].includes(chars_1_2) ) {
    return false;
  }

  let count = 0;
  const pounds = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2, 1];
  for (let index = 0; index < pounds.length; index++) {
    count += Number(cuitNoHyphens.charAt(index)) * pounds[index];
  }
  if (count % 11 !== 0) {
    // not divisible by 11
    return false;
  }
  return true;
}
