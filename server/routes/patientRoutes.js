import express from 'express';
import Patient from '../models/Patient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.phone) filter.phone_number = req.query.phone
    const patients = await Patient.find(filter)
    res.json(patients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router;
