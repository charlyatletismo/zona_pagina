import { describe, expect, it } from 'vitest';
import { decodeRFID, normalizeChip, rfidToBib, tryRfidToBib } from '@/lib/rfid';

// Raw reads as typed by the RFID reader
const RAW_CH00001 = '3C2E37323929312A35313734';
const RAW_CH00798 = '3C2E3732392938333C313734';
const RAW_CH00454 = '3C2E37323929352F38313734';

describe('normalizeChip', () => {
  it('trims, removes whitespace and uppercases', () => {
    expect(normalizeChip('  ch 00 798\n')).toBe('CH00798');
  });
});

describe('decodeRFID', () => {
  it('decodes raw reader output', () => {
    expect(decodeRFID(RAW_CH00001)).toBe('CH00001');
    expect(decodeRFID(RAW_CH00798)).toBe('CH00798');
    expect(decodeRFID(RAW_CH00454)).toBe('CH00454');
  });

  it('accepts raw reads in lowercase or with surrounding whitespace', () => {
    expect(decodeRFID(` ${RAW_CH00798.toLowerCase()} `)).toBe('CH00798');
  });

  it('accepts an already decoded chip id', () => {
    expect(decodeRFID('ch00798')).toBe('CH00798');
  });

  it('rejects incomplete or unknown reads', () => {
    expect(() => decodeRFID('3C2E3732')).toThrow('Lectura RFID no reconocida');
    expect(() => decodeRFID('')).toThrow('Lectura RFID no reconocida');
    expect(() => decodeRFID('12')).toThrow('Lectura RFID no reconocida');
  });

  it('rejects reads that do not decode to an alphanumeric label', () => {
    // 0x00 bytes decode to control characters
    expect(() => decodeRFID('3C2E37320000000000313734')).toThrow('no se pudo decodificar');
  });
});

describe('rfidToBib', () => {
  it('maps the chip number to the bib number', () => {
    expect(rfidToBib(RAW_CH00001)).toBe(1);
    expect(rfidToBib(RAW_CH00798)).toBe(798);
    expect(rfidToBib('CH00454')).toBe(454);
  });

  it('rejects chips that are not a valid bib', () => {
    expect(() => rfidToBib('CH00000')).toThrow('no corresponde a un número de dorsal');
    expect(() => rfidToBib('CHAB123')).toThrow('no corresponde a un número de dorsal');
  });
});

describe('tryRfidToBib', () => {
  it('returns the bib or null instead of throwing', () => {
    expect(tryRfidToBib(RAW_CH00798)).toBe(798);
    expect(tryRfidToBib('3C2E37')).toBeNull();
    expect(tryRfidToBib('CH00000')).toBeNull();
  });
});
