import { Schema, model, type InferSchemaType } from 'mongoose';
import { MODEL_LAYERS } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → hotspots. `termKey` references terms.key — a hotspot never
// copies term text (docs/03); the app resolves the term at read time.
const hotspotSchema = new Schema(
  {
    modelKey: { type: String, required: true, lowercase: true, trim: true },
    termKey: { type: String, required: true, lowercase: true, trim: true },
    meshName: { type: String },
    position: { type: [Number], required: true },
    layer: { type: String, enum: [...MODEL_LAYERS] },
    camera: {
      position: { type: [Number], required: true },
      target: { type: [Number], required: true },
      zoom: { type: Number },
    },
    order: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

// Hotspots are read per model in `order`; the term link is indexed for the reverse lookup.
hotspotSchema.index({ modelKey: 1, order: 1 });
hotspotSchema.index({ termKey: 1 });

export type Hotspot = InferSchemaType<typeof hotspotSchema>;

export const HotspotModel = model('Hotspot', hotspotSchema);
