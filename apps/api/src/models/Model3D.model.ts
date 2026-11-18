import { Schema, model, type InferSchemaType } from 'mongoose';
import { MODEL_LAYERS, MODEL_STATUSES, MODEL_SYSTEMS } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → models3d. Model files are referenced by URL (the API is
// JSON-only, docs/02); `versions.light` is the LOD the app loads first, `detailed` is lazy-loaded.
const versionSchema = new Schema(
  {
    url: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    polyCount: { type: Number, required: true },
  },
  { _id: false },
);

const layerSchema = new Schema(
  {
    key: { type: String, enum: [...MODEL_LAYERS], required: true },
    meshNames: { type: [String], default: [] },
  },
  { _id: false },
);

const model3dSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    titleTermKey: { type: String, required: true },
    system: { type: String, enum: [...MODEL_SYSTEMS], required: true },
    versions: {
      light: { type: versionSchema, required: true },
      detailed: { type: versionSchema },
    },
    layers: { type: [layerSchema], default: [] },
    license: { type: String, required: true },
    attribution: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    status: { type: String, enum: [...MODEL_STATUSES], required: true, default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

model3dSchema.index({ system: 1 });
model3dSchema.index({ status: 1 });

export type Model3D = InferSchemaType<typeof model3dSchema>;

// Third arg pins the collection to the name in docs/03 (`models3d`, not mongoose's `model3ds`).
export const Model3DModel = model('Model3D', model3dSchema, 'models3d');
