// T-023 — import the manual heart-anatomy CSV as `needs_review` terms.
//
//   npm run import:anatomy -w @nabd/api                 read the CSV, write to MONGODB_URI
//   npm run import:anatomy -w @nabd/api -- --dry-run     read + preview, write nothing
//
// The list lives next to this file: heart-terms.csv (columns: key, ar, fr, en, latin).
// Every row is stored as `needs_review` — a doctor_reviewer verifies it before students see it.
// Re-runnable: rows already present (by `key`) are skipped.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CreateTermInput } from '@nabd/shared';
import { connectDb, disconnectDb } from '../../config/db';
import { TermModel } from '../../models/Term.model';
import { parseCsvRecords } from './csv';
import { buildTermInput } from './terms';

const CSV_PATH = join(__dirname, 'heart-terms.csv');
// T-023's Done-when asks for at least this many terms.
const DONE_WHEN_TARGET = 30;

async function main(): Promise<void> {
  const dryRun = process.argv.slice(2).includes('--dry-run');
  const rows = parseCsvRecords(readFileSync(CSV_PATH, 'utf8'));

  const inputs: CreateTermInput[] = [];
  let skippedBlankKey = 0;
  let skippedInvalid = 0;

  for (const row of rows) {
    if ((row.key ?? '').trim() === '') {
      skippedBlankKey += 1;
      continue;
    }
    const input = buildTermInput(row);
    if (input === null) {
      skippedInvalid += 1;
      console.warn(`[anatomy] skipped invalid row: ${JSON.stringify(row)}`);
      continue;
    }
    inputs.push(input);
  }

  console.log(
    `[anatomy] ${rows.length} rows → ${inputs.length} valid terms` +
      (skippedInvalid + skippedBlankKey > 0
        ? ` (skipped: invalid ${skippedInvalid}, blank key ${skippedBlankKey})`
        : ''),
  );

  if (dryRun) {
    console.log(JSON.stringify(inputs.slice(0, 5), null, 2));
    console.log(`[anatomy] dry-run: nothing written (would import ${inputs.length}).`);
    return;
  }

  await connectDb();
  let imported = 0;
  let skippedExisting = 0;

  for (const input of inputs) {
    // Idempotent re-runs: the same key means the term is already there.
    const existing = await TermModel.findOne({ key: input.key });
    if (existing) {
      skippedExisting += 1;
      continue;
    }
    await TermModel.create(input);
    imported += 1;
  }

  await disconnectDb();
  console.log(
    `[anatomy] imported ${imported} · already present ${skippedExisting} (all "needs_review")`,
  );
  if (imported + skippedExisting < DONE_WHEN_TARGET) {
    console.log(
      `[anatomy] note: T-023 wants ${DONE_WHEN_TARGET} terms — add rows to heart-terms.csv.`,
    );
  }
}

main().catch((err: unknown) => {
  console.error('[anatomy] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
