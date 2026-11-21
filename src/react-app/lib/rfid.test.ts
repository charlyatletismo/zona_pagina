import { describe, expect, it } from 'vitest';
import { rfidOrChipToBib } from '@/lib/rfid';

// Raw reads as typed by the RFID reader
const RAW_00001 = '3C2E37323929312A35313734';
const RAW_00798 = '3C2E3732392938333C313734';
const RAW_00454 = '3C2E37323929352F38313734';
const LABEL_MALFORMED_00798 = '   \t00 798\n';
const LABEL_MALFORMED_AB798 = ' a  \tb 798\n';
const RAW_MALFORMED_00798 = '3C2E 3732 3929 3833 3C31 3734';
const RAW_MALFORMED_00454 = '3C 2E3 732 \n    39 \t29352F38313734'

describe('rfidOrChipToBib', () => {
  it('decodes raw reader output', () => {
    expect(rfidOrChipToBib(RAW_00001)).toBe(1);
    expect(rfidOrChipToBib(RAW_00798)).toBe(798);
    expect(rfidOrChipToBib(RAW_00454)).toBe(454);
  });

  it('accepts raw reads in lowercase or with surrounding whitespace', () => {
    expect(rfidOrChipToBib(` ${RAW_00798.toLowerCase()} `)).toBe(798);
    expect(rfidOrChipToBib(RAW_MALFORMED_00798)).toBe(798);
    expect(rfidOrChipToBib(RAW_MALFORMED_00454)).toBe(454);
  });

  it('accepts an already decoded chip id', () => {
    expect(rfidOrChipToBib('00798')).toBe(798);
    expect(rfidOrChipToBib('798')).toBe(798);
    expect(rfidOrChipToBib(LABEL_MALFORMED_00798)).toBe(798);
  });

  it('rejects incomplete or unknown reads', () => {
    expect(() => rfidOrChipToBib('3C2E3732')).toThrow('Lectura RFID inválida');
    expect(() => rfidOrChipToBib('')).toThrow('Lectura RFID inválida');
    expect(() => rfidOrChipToBib(LABEL_MALFORMED_AB798)).toThrow('Lectura RFID inválida');
  });

  it('rejects reads that do not decode to a numberic label', () => {
    // 0x00 bytes decode to control characters
    expect(() => rfidOrChipToBib('3C2E37320000000000313734')).toThrow('El chip se leyó, pero su decodificación arrojó caracteres inválidos.');
  });
});
