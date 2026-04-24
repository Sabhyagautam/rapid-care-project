import express from 'express';
import { getAllBookings, getBookingById, updateBooking, cancelBooking, submitFeedback } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.patch('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/feedback', submitFeedback);

export default router;
