import { Schema, model, type InferSchemaType } from 'mongoose';
import { DISEASE_STATUSES } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → diseases. Stages restyle the SAME model (materials/visibility)
// — the API stores the recipe, the viewer applies it (T-041). References are term keys, never text.
const visualSchema = new Schema(
  {
    materialOverrides: { type: Schema.Types.Mixed },
    highlightMeshes: { type: [String], default: undefined },
    vesselNarrowing: { type: Number },
  },
  { _id: false },
);

const stageSchema = new Schema(
  {
    key: { type: String, required: true },
    labelTermKey: { type: String },
    visual: { type: visualSchema, default: () => ({}) },
  },
  { _id: false },
);

const icd11Schema = new Schema(
  {
    code: { type: String },
    uri: { type: String },
  },
  { _id: false },
);

const diseaseSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    termKey: { type: String, required: true },
    icd11: { type: icd11Schema },
    modelKey: { type: String, required: true },
    stages: { type: [stageSchema], default: [] },
    symptomTermKeys: { type: [String], default: [] },
    videoIds: { type: [String], default: undefined },
    quizId: { type: String },
    status: { type: String, enum: [...DISEASE_STATUSES], required: true, default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

diseaseSchema.index({ status: 1 });
diseaseSchema.index({ modelKey: 1 });
diseaseSchema.index({ termKey: 1 });

export type Disease = InferSchemaType<typeof diseaseSchema>;

// Third arg pins the collection to the name in docs/03 (`diseases`).
export const DiseaseModel = model('Disease', diseaseSchema, 'diseases');
