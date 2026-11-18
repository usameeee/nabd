// T-022 — import heart-related ICD-11 disease entities as `needs_review` terms.
//
//   npm run import:icd11 -w @nabd/api                 fetch, then write to MONGODB_URI
//   npm run import:icd11 -w @nabd/api -- --dry-run     fetch + preview, write nothing
//   npm run import:icd11 -w @nabd/api -- --limit=20    stop after N drafts
//
// Needs ICD11_CLIENT_ID + ICD11_CLIENT_SECRET in apps/api/.env (free key: https://icd.who.int/icdapi).
// The heart scope is the query list in ./terms.ts; nothing is translated or rewritten here.

import { connectDb, disconnectDb } from '../../config/db';
import { env } from '../../config/env';
import { TermModel } from '../../models/Term.model';
import { createIcd11Client, type IcdSearchHit } from './client';
import { HEART_QUERIES, buildTermDraft, type TermDraft } from './terms';

// Sequential requests with a small gap — stay polite with the WHO API.
const REQUEST_GAP_MS = 150;
// T-022's Done-when asks for at least this many imported terms.
const DONE_WHEN_TARGET = 20;

function readLimit(argv: string[]): number | null {
  const flag = argv.find((arg) => arg.startsWith('--limit='));
  if (flag === undefined) return null;
  const value = Number(flag.slice('--limit='.length));
  return Number.isInteger(value) && value > 0 ? value : null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function collectDrafts(limit: number | null): Promise<{
  drafts: TermDraft[];
  discovered: number;
  skippedNoTranslations: number;
  skippedDuplicateKey: number;
  skippedInvalid: number;
}> {
  const client = createIcd11Client();

  // 1. Discover heart-related entities (one search per query, de-duplicated by entity id).
  const discovered = new Map<string, IcdSearchHit>();
  for (const query of HEART_QUERIES) {
    const hits = await client.search(query);
    for (const hit of hits) {
      discovered.set(hit.id, hit);
    }
    console.log(`[icd11] search "${query}" → ${hits.length} hits (${discovered.size} unique)`);
    await delay(REQUEST_GAP_MS);
  }

  // 2. One entity → one draft; entities missing a language layer are skipped, not faked.
  const drafts: TermDraft[] = [];
  const seenKeys = new Set<string>();
  let skippedNoTranslations = 0;
  let skippedDuplicateKey = 0;
  let skippedInvalid = 0;

  for (const hit of discovered.values()) {
    if (limit !== null && drafts.length >= limit) break;

    const texts = await client.entityTexts(hit.id);
    const { ar, fr, en } = texts.titles;

    if (ar === undefined || fr === undefined || en === undefined) {
      skippedNoTranslations++;
    } else {
      const draft = buildTermDraft(hit.id, texts);
      if (draft === null) {
        skippedInvalid++;
      } else if (seenKeys.has(draft.key)) {
        skippedDuplicateKey++;
      } else {
        seenKeys.add(draft.key);
        drafts.push(draft);
      }
    }

    await delay(REQUEST_GAP_MS);
  }

  return {
    drafts,
    discovered: discovered.size,
    skippedNoTranslations,
    skippedDuplicateKey,
    skippedInvalid,
  };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const limit = readLimit(argv);

  console.log(
    `[icd11] release ${env.icd11Release} · ${dryRun ? 'dry-run (no DB write)' : 'import'}${limit === null ? '' : ` · limit ${limit}`}`,
  );

  const result = await collectDrafts(limit);

  if (dryRun) {
    console.log(`[icd11] dry-run: ${result.drafts.length} terms ready, nothing written.`);
    console.log(JSON.stringify(result.drafts.slice(0, 5).map((draft) => draft.input), null, 2));
  } else {
    await connectDb();
    let imported = 0;
    let skippedExisting = 0;

    for (const draft of result.drafts) {
      // Idempotent re-runs: same key OR same ICD-11 entity URI means it is already there.
      const existing = await TermModel.findOne({
        $or: [{ key: draft.key }, { sourceRef: draft.sourceRef }],
      });
      if (existing) {
        skippedExisting++;
        continue;
      }
      await TermModel.create(draft.input);
      imported++;
    }

    await disconnectDb();
    console.log(
      `[icd11] imported ${imported} · already present ${skippedExisting} (all with status "needs_review")`,
    );
    if (imported < DONE_WHEN_TARGET) {
      console.log(
        `[icd11] note: T-022 wants ${DONE_WHEN_TARGET}+ terms — extend HEART_QUERIES and re-run.`,
      );
    }
  }

  console.log(
    `[icd11] summary: discovered ${result.discovered} · drafts ${result.drafts.length} · missing translations ${result.skippedNoTranslations} · duplicate key ${result.skippedDuplicateKey} · invalid ${result.skippedInvalid}`,
  );
}

main().catch((err: unknown) => {
  console.error('[icd11] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
