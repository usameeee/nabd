import { Schema, model, type InferSchemaType } from 'mongoose';
import { TERM_CATEGORIES, TERM_SOURCES, TERM_STATUSES } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → terms.
const termSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ar: { type: String, required: true },
    fr: { type: String, required: true },
    en: { type: String, required: true },
    latin: { type: String },
    definition: {
      ar: { type: String },
      fr: { type: String },
      en: { type: String },
    },
    category: { type: String, enum: [...TERM_CATEGORIES], required: true },
    source: { type: String, enum: [...TERM_SOURCES], required: true },
    sourceRef: { type: String },
    license: { type: String, required: true },
    attribution: { type: String },
    status: { type: String, enum: [...TERM_STATUSES], required: true, default: 'draft' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    audio: {
      ar: { type: String },
      fr: { type: String },
      en: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// docs/03: key unique; text index on ar/fr/en; status; category.
termSchema.index({ ar: 'text', fr: 'text', en: 'text' });
termSchema.index({ status: 1 });
termSchema.index({ category: 1 });

export type Term = InferSchemaType<typeof termSchema>;

export const TermModel = model('Term', termSchema);
