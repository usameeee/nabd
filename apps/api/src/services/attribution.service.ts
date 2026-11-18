import type { FilterQuery } from 'mongoose';
import type { AttributionEntry, AttributionListQuery } from '@nabd/shared';
import { Model3DModel, type Model3D } from '../models/Model3D.model';
import { TermModel, type Term } from '../models/Term.model';

// Student-facing reads pass `{ onlyVerified: true }` so drafts never leak (docs/02 publishing gate).
interface ReadOptions {
  onlyVerified?: boolean;
}

// The "Sources & licenses" page is a GENERATED view (docs/03 → attributions): nothing is stored, so
// one entry is derived per content document from its `license`/`attribution` fields. External media
// (videos, images) will join here once such a collection exists.
export async function listAttributions(query: AttributionListQuery, options: ReadOptions = {}) {
  const termFilter: FilterQuery<Term> = options.onlyVerified ? { status: 'verified' } : {};
  const modelFilter: FilterQuery<Model3D> = options.onlyVerified ? { status: 'verified' } : {};

  const wantModels = query.kind === undefined || query.kind === 'model';
  const wantTerms = query.kind === undefined || query.kind === 'term';

  const [models, terms] = await Promise.all([
    wantModels ? Model3DModel.find(modelFilter) : [],
    wantTerms ? TermModel.find(termFilter) : [],
  ]);

  const entries: AttributionEntry[] = [
    ...models.map((model) => ({
      key: model.key,
      kind: 'model' as const,
      title: model.key,
      license: model.license,
      attribution: model.attribution,
      sourceUrl: model.sourceUrl,
    })),
    ...terms.map((term) => ({
      key: term.key,
      kind: 'term' as const,
      title: term.ar,
      license: term.license,
      // `attribution` is optional on a term (docs/03); fall back to the source name.
      attribution: term.attribution ?? term.source,
      sourceUrl: term.sourceRef ?? undefined,
    })),
  ].sort((a, b) => a.kind.localeCompare(b.kind) || a.key.localeCompare(b.key));

  const total = entries.length;
  const start = (query.page - 1) * query.limit;
  const items = entries.slice(start, start + query.limit);

  return { items, page: query.page, limit: query.limit, total };
}
