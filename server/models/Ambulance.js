import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  ambulance_number: { type: String, required: true, unique: true },
  ambulance_type: { type: String, enum: ['Basic', 'Oxygen', 'ICU'], required: true },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
}, { timestamps: true });

export default mongoose.model('Ambulance', ambulanceSchema);
