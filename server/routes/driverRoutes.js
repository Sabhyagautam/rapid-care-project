import express from 'express';
import Driver from '../models/Driver.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find().populate('ambulance_id');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
