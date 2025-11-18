import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import Event, { type EventDocument } from './event.model';

// Strongly typed Booking document interface
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

// Simple but robust email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // Index for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Additional explicit index definition (in case we need compound indexes later)
BookingSchema.index({ eventId: 1 });

// Pre-save hook to validate email format and referenced event
BookingSchema.pre<BookingDocument>('save', async function bookingPreSave(next) {
  try {
    // Validate email format before saving
    if (!EMAIL_REGEX.test(this.email)) {
      throw new Error('Invalid email address');
    }

    // Ensure the referenced event exists before creating a booking
    const existingEvent: (EventDocument & { _id: Types.ObjectId }) | null = await Event.findById(this.eventId).lean<EventDocument & { _id: Types.ObjectId }>();

    if (!existingEvent) {
      throw new Error('Cannot create booking: referenced event does not exist');
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Use cached model if it exists to avoid recompilation in dev
const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ||
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema);

export default Booking;
