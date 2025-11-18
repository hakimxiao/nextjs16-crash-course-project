import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Strongly typed Event document interface
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO date string (e.g., 2025-01-31)
  time: string; // 24h time string (HH:mm)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDocument>;

// Helper to create a URL-friendly slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
}

// Normalize date to an ISO date string (YYYY-MM-DD)
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid event date');
  }

  // Keep only the date portion for consistency
  return date.toISOString().split('T')[0];
}

// Normalize time to 24h HH:mm format
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  // Supports formats like HH:mm, H:mm, HHmm, and with optional AM/PM
  const timeRegex = /^(\d{1,2})(?::?(\d{2}))\s*(AM|PM|am|pm)?$/;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error('Invalid event time');
  }

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2] ?? '0', 10);
  const meridiem = match[3]?.toLowerCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Invalid event time');
  }

  // Convert 12h to 24h if AM/PM is provided
  if (meridiem) {
    if (hour === 12) {
      hour = meridiem === 'am' ? 0 : 12;
    } else if (meridiem === 'pm') {
      hour += 12;
    }
  }

  const hourStr = hour.toString().padStart(2, '0');
  const minuteStr = minute.toString().padStart(2, '0');

  return `${hourStr}:${minuteStr}`;
}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Ensure unique index on slug at the schema level
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook to handle slug generation, date/time normalization, and validation
EventSchema.pre<EventDocument>('save', function eventPreSave(next) {
  try {
    // Validate required string fields are present and non-empty
    const requiredStringFields: (keyof EventDocument)[] = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = this[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Field "${String(field)}" is required`);
      }
    }

    // Validate required array fields
    const requiredArrayFields: (keyof EventDocument)[] = ['agenda', 'tags'];

    for (const field of requiredArrayFields) {
      const value = this[field];
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`Field "${String(field)}" must be a non-empty array`);
      }
    }

    // Generate or update slug when title changes
    if (this.isModified('title')) {
      this.slug = generateSlug(this.title);
    }

    // Normalize date and time formats for consistency
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Use cached model if it exists to avoid recompilation in dev
const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ||
  mongoose.model<EventDocument, EventModel>('Event', EventSchema);

export default Event;
