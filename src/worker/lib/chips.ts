import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { chips } from "../db/schema";


export const getNextChipId = async (db: DrizzleD1Database, chip_id: string | null): Promise<string> => {
  if (chip_id === null) {
    const firstChipRange = await db
      .select({
        prefix: chips.prefix,
        padding_n: chips.padding_n,
        start: chips.start,
        end: chips.end,
      })
      .from(chips)
      .orderBy(
        asc(chips.prefix),
        asc(chips.padding_n),
        asc(chips.start),
      )
      .limit(1)
      .get();
    if (!firstChipRange) {
      throw new Error("No chip ranges defined in the database");
    }
    return firstChipRange.prefix + `${firstChipRange.start}`.padStart(firstChipRange.padding_n, "0");
  }

  const idxStartNumbers = chip_id.search(/\d/);
  if (idxStartNumbers === -1) {
    throw new Error("Invalid chip_id format, no numbers found");
  }
  const prefix = chip_id.substring(0, idxStartNumbers);
  const padding_n = chip_id.substring(idxStartNumbers).length;
  const numberPart = Number(chip_id.substring(idxStartNumbers));

  const currentChipRange = await db
    .select({
      id: chips.id,
      end: chips.end,
    })
    .from(chips)
    .where(and(
      eq(chips.prefix, prefix),
      eq(chips.padding_n, padding_n),
      lte(chips.start, numberPart),
      gte(chips.end, numberPart),
    ))
    .get();

  if (currentChipRange && currentChipRange.end > numberPart) {
    return prefix + `${numberPart + 1}`.padStart(padding_n, "0");
  }

  const chipRanges = await db
    .select({
      id: chips.id,
      prefix: chips.prefix,
      padding_n: chips.padding_n,
      start: chips.start,
      end: chips.end,
    })
    .from(chips)
    .orderBy(
      asc(chips.prefix),
      asc(chips.padding_n),
      asc(chips.start),
    )
    .all();

  let flag = false;
  for (let index = 0; index < chipRanges.length; index++) {
    const currentRange = chipRanges[index];
    if (!flag) {
      if ((
          currentChipRange
          && currentRange.id === currentChipRange.id
        ) || (
          !currentChipRange
          && currentRange.prefix === prefix
          && currentRange.padding_n === padding_n
        )) {
        if (numberPart >= currentRange.end && chipRanges[index + 1] && numberPart < chipRanges[index + 1].start) {
          flag = true;
        }
      } else if (currentRange.prefix > prefix || (currentRange.prefix === prefix && currentRange.padding_n > padding_n)) {
        // If the current range is greater than the prefix of the chip_id, it means that the chip_id is out of all
        // defined ranges and we should return the first chip of the current range
        return currentRange.prefix + `${currentRange.start}`.padStart(currentRange.padding_n, "0");
      }
    } else {
      return currentRange.prefix + `${currentRange.start}`.padStart(currentRange.padding_n, "0");
    }
  }
  throw new Error("No more chips available in the defined ranges");
}