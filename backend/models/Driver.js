import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  driver_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  license_number: { type: String, required: true, unique: true },
  experience: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  ambulance_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
