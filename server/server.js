import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import Booking from './models/Booking.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: [
      '*'
    ],
    credentials: true 
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);

// Expose io so routes can emit events
app.set('io', io);

// Store connected drivers and patients
const connectedDrivers = new Map();
const connectedPatients = new Map();

// Socket.io Real-time Communication
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // DRIVER REGISTRATION
  socket.on('driverOnline', (driverData) => {
    connectedDrivers.set(socket.id, {
      driverId: driverData.driverId,
      driverName: driverData.driverName,
      phone: driverData.phone,
      ambulanceNumber: driverData.ambulanceNumber,
      location: driverData.location
    });
    console.log('🚗 Driver online:', driverData.driverName);
    io.emit('driverCount', connectedDrivers.size);
  });

  // PATIENT REGISTRATION
  socket.on('patientOnline', (patientData) => {
    connectedPatients.set(socket.id, patientData);
    console.log('👤 Patient online:', patientData.patientName);
  });

  // AMBULANCE REQUEST FROM PATIENT
  socket.on('ambulanceRequest', async (bookingData) => {
    console.log('🚨 New ambulance request:', bookingData);
    
    try {
      // Save to database
      const booking = await Booking.create({
        patient_id: bookingData.patientId || null,
        emergency_type: bookingData.emergencyType,
        pickup_location: bookingData.pickupLocation,
        hospital_destination: bookingData.dropLocation,
        location: {
          lat: bookingData.latitude || 0,
          lng: bookingData.longitude || 0
        },
        fare_estimate: bookingData.fareEstimate || 0,
        distance_km: bookingData.distanceKm || 0,
        status: 'pending',
        request_time: new Date()
      });

      console.log('✅ Booking created in DB:', booking._id);

      // Send confirmation to patient
      socket.emit('bookingCreated', {
        rideId: booking._id,
        status: 'pending'
      });

      // Broadcast to all connected drivers
      const rideRequest = {
        rideId: booking._id,
        patientName: bookingData.patientName,
        phone: bookingData.phone,
        pickupLocation: bookingData.pickupLocation,
        dropLocation: bookingData.dropLocation,
        latitude: bookingData.latitude || 0,
        longitude: bookingData.longitude || 0,
        emergencyType: bookingData.emergencyType,
        requestTime: bookingData.requestTime,
        distance: '2.5 km' // Calculate actual distance
      };

      io.emit('newRideRequest', rideRequest);
      console.log('📢 Broadcast to', connectedDrivers.size, 'drivers');
    } catch (error) {
      console.error('❌ Error creating booking:', error.message);
      socket.emit('bookingError', { message: error.message });
    }
  });

  // DRIVER ACCEPTS RIDE
  socket.on('acceptRide', async (data) => {
    console.log('✅ Driver accepted ride:', data);
    
    try {
      const { driverId, rideId, driverName, phone, ambulanceNumber } = data;

      await Booking.findByIdAndUpdate(rideId, {
        driver_id: driverId,
        driver_name: driverName,
        driver_phone: phone,
        ambulance_number: ambulanceNumber,
        status: 'accepted',
        accepted_time: new Date()
      });

      // Notify patient that ride is accepted
      io.emit('rideAccepted', {
        rideId,
        driverName,
        phone,
        ambulanceNumber,
        estimatedArrival: '8-12 minutes'
      });

      // Remove request from other drivers
      io.emit('rideNoLongerAvailable', { rideId });

      console.log('✅ Ride accepted and patient notified');
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  });

  // DRIVER REJECTS RIDE
  socket.on('rejectRide', async (data) => {
    console.log('❌ Driver rejected ride:', data);
    
    try {
      const { rideId } = data;
      
      // Notify patient that ride was rejected
      io.emit('rideRejected', { rideId });
      
      console.log('📢 Notified patient of rejection');
    } catch (error) {
      console.error('Error rejecting ride:', error);
    }
  });

  // LIVE DRIVER LOCATION UPDATES
  socket.on('driverLocation', (locationData) => {
    const { rideId, latitude, longitude } = locationData;
    
    // Forward location to patient
    io.emit('updateDriverLocation', {
      rideId,
      latitude,
      longitude
    });
  });

  // PATIENT CANCELS RIDE
  socket.on('cancelRide', async (data) => {
    const { rideId, reason } = data;
    try {
      await Booking.findByIdAndUpdate(rideId, {
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by patient'
      });
      io.emit('rideCancelled', { rideId });
      console.log('🚫 Ride cancelled:', rideId);
    } catch (error) {
      console.error('Error cancelling ride:', error);
    }
  });

  // PATIENT SKIPPED FEEDBACK
  socket.on('feedbackSkipped', ({ rideId }) => {
    io.emit('feedbackReceived', { rideId, rating: null, skipped: true });
  });

  // RIDE COMPLETED
  socket.on('rideCompleted', async (data) => {
    try {
      const { rideId, driverId } = data;
      const booking = await Booking.findByIdAndUpdate(rideId, {
        status: 'completed',
        completion_time: new Date()
      }, { new: true });

      // Send to patient with booking + driver info for feedback
      io.emit('rideCompletedNotification', {
        rideId,
        driverName: booking?.driver_name,
        driverId,
        fareEstimate: booking?.fare_estimate
      });
      console.log('✅ Ride marked as completed:', rideId);
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    if (connectedDrivers.has(socket.id)) {
      const driver = connectedDrivers.get(socket.id);
      console.log('🚗 Driver offline:', driver.driverName);
      connectedDrivers.delete(socket.id);
      io.emit('driverCount', connectedDrivers.size);
    }
    
    if (connectedPatients.has(socket.id)) {
      connectedPatients.delete(socket.id);
    }
    
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`👉 Run this to fix it: kill -9 $(lsof -ti:${PORT})`);
    console.error(`   Then restart: npm run dev`);
    process.exit(1);
  } else {
    throw err;
  }
});

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Rapid Care Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready`);
  console.log(`📦 MongoDB connecting...`);
  console.log(`\n   Patient app:  http://localhost:5173`);
  console.log(`   Driver app:   http://localhost:5174\n`);
});
