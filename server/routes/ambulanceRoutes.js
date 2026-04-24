import express from 'express';
import Ambulance from '../models/Ambulance.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json(ambulance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ status: 'available' }).populate('driver_id');
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
