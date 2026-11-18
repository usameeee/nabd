import { Schema, model, type InferSchemaType } from 'mongoose';
import { LESSON_STATUSES, LESSON_STEP_TYPES } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → lessons. Lesson titles are authored text (ar required,
// fr/en optional) — they are NOT term references. Steps point at other content by key/id.
const localizedTextSchema = new Schema(
  {
    ar: { type: String, required: true },
    fr: { type: String },
    en: { type: String },
  },
  { _id: false },
);

const stepRefSchema = new Schema(
  {
    modelKey: { type: String },
    hotspotIds: { type: [String], default: undefined },
    diseaseKey: { type: String },
    videoId: { type: String },
    caseId: { type: String },
    quizId: { type: String },
  },
  { _id: false },
);

const stepSchema = new Schema(
  {
    type: { type: String, enum: [...LESSON_STEP_TYPES], required: true },
    ref: { type: stepRefSchema, default: () => ({}) },
    xp: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const lessonSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: localizedTextSchema, required: true },
    unit: { type: String, required: true },
    order: { type: Number, required: true },
    faculty: { type: String },
    year: { type: Number },
    steps: { type: [stepSchema], default: [] },
    // Terms unlocked by finishing the lesson — references, never copied text (docs/03).
    termKeys: { type: [String], default: [] },
    status: { type: String, enum: [...LESSON_STATUSES], required: true, default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

lessonSchema.index({ status: 1 });
lessonSchema.index({ unit: 1, order: 1 });

export type Lesson = InferSchemaType<typeof lessonSchema>;

// Third arg pins the collection to the name in docs/03 (`lessons`).
export const LessonModel = model('Lesson', lessonSchema, 'lessons');
