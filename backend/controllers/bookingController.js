import Booking from '../models/Booking.js';

// helper to get io instance
const getIO = (req) => req.app.get('io');

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('patient_id')
      .sort({ request_time: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('patient_id');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient_id');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancellation_reason: req.body.reason || 'Cancelled by user' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback_comment, ride_confirmed_by_patient } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating (1-5) is required' });
    }
    if (ride_confirmed_by_patient === undefined) {
      return res.status(400).json({ message: 'Please confirm if the ride was completed' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { rating, feedback_comment, ride_confirmed_by_patient, feedback_submitted_at: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Notify driver that feedback is done — clears their waiting screen
    const io = getIO(req);
    if (io) {
      io.emit('feedbackReceived', {
        rideId: req.params.id,
        rating,
        driverId: booking.driver_id,
      });
    }

    res.json({ message: 'Feedback submitted', booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};