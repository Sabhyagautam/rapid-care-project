import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  driver_id: { type: String },
  emergency_type: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arriving', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickup_location: { type: String, required: true },
  hospital_destination: { type: String, required: true },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  fare_estimate: { type: Number, default: 0 },
  distance_km: { type: Number, default: 0 },
  driver_name: { type: String },
  driver_phone: { type: String },
  ambulance_number: { type: String },
  cancellation_reason: { type: String },
  // Feedback
  rating: { type: Number, min: 1, max: 5 },
  feedback_comment: { type: String },
  ride_confirmed_by_patient: { type: Boolean },
  feedback_submitted_at: { type: Date },
  request_time: { type: Date, default: Date.now },
  accepted_time: { type: Date },
  completion_time: { type: Date },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
