// Decoding of the raw strings typed by the RFID reader (keyboard emulation).
// The reader wraps the chip label as 3C2E3732 + 5 hex-encoded bytes + 313734,
// and each byte is shifted by a fixed offset.
const OFFSETS = [-9, 7, -1, 6, -4];
const RAW_PATTERN = /^3C2E3732([0-9A-F]{10})313734$/;
const CHIP_PATTERN = /^CH[A-Z0-9]{5}$/;

export const normalizeChip = (str: string) => str.trim().replace(/\s+/g, '').toUpperCase();

// Returns the chip id (ex: CH00798) or throws if the read is not recognized
export const decodeRFID = (raw: string): string => {
  const s = normalizeChip(raw);
  if (CHIP_PATTERN.test(s)) return s;
  const match = RAW_PATTERN.exec(s);
  if (!match) throw new Error('Lectura RFID no reconocida. Revisá que el lector esté activo.');
  let label = '';
  for (let i = 0; i < 5; i++) {
    label += String.fromCharCode(parseInt(match[1].slice(i * 2, i * 2 + 2), 16) + OFFSETS[i]);
  }
  label = label.toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(label)) throw new Error('El chip se leyó, pero no se pudo decodificar.');
  return 'CH' + label;
};

// Chips are mapped 1:1 with bib numbers (CH00012 -> bib 12)
export const rfidToBib = (raw: string): number => {
  const label = decodeRFID(raw).slice(2);
  const bib = Number(label);
  if (!/^\d+$/.test(label) || bib <= 0) throw new Error(`El chip ${label} no corresponde a un número de dorsal.`);
  return bib;
};

export const tryRfidToBib = (raw: string): number | null => {
  try {
    return rfidToBib(raw);
  } catch {
    return null;
  }
};
