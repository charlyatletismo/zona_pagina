// Decoding of the raw strings typed by the RFID reader (keyboard emulation).
// The reader wraps the chip label as 3C2E3732 + 5 hex-encoded bytes + 313734,
// and each byte is shifted by a fixed offset.
const OFFSETS = [-9, 7, -1, 6, -4];
const RAW_PATTERN = /^3C2E3732([0-9A-F]{10})313734$/;

const CHIP_PATTERN = /^[0-9]+$/;

// .trim() -> removes whitespace at the start and end
// .replace(...) -> removes any whitespace left in the middle (spaces, tabs, newlines)
// .toUpperCase() -> RAW_PATTERN accepts only capital letters A-F
const normalizeChip = (str: string) => str.trim().replace(/\s+/g, '').toUpperCase();

// Returns the chip id (ex: CH00798) or throws if the read is not recognized
const decodeRFID = (reading: string): string => {
  const match = RAW_PATTERN.exec(reading);
  if (!match) {
    throw Error('Lectura RFID inválida')
  };

  let label = '';
  for (let i = 0; i < OFFSETS.length; i++) {
    // TODO: add comment explaining this code
    label += String.fromCharCode(
      parseInt(match[1].slice(i * 2, i * 2 + 2), 16) + OFFSETS[i]
    );
  }
  label = label.toUpperCase();

  if (!/^[0-9]*$/.test(label)) {
    throw Error('El chip se leyó, pero su decodificación arrojó caracteres inválidos.')
  };

  return label;
};

const labelToBib = (label: string): number => {
  const bib = Number(label);
  if (isNaN(bib) || bib <= 0) {
    throw Error(`El chip ${label} no corresponde a un número de dorsal.`)
  }
  return bib;
}

// Chips are mapped 1:1 with bib numbers (CH00012 -> bib 12)
export const rfidOrChipToBib = (raw: string): number => {
  const normalizedRaw = normalizeChip(raw);

  if (CHIP_PATTERN.test(normalizedRaw)) {
    // raw is already the chip label
    return labelToBib(normalizedRaw);
  };

  const label = decodeRFID(normalizedRaw);
  if (!label) {
    throw Error("La lectura fue decodificada, pero no arrojó resultados")
  }
  return labelToBib(label);
};

export const safeRfidOrChipToBib = (raw: string): {bib?: number, error_msg?: string} => {
  try {
    return {
      bib: rfidOrChipToBib(raw)
    };
  } catch (e) {
    return {
      error_msg: String(e)
    }
  }
}
