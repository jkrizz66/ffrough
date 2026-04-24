console.log("🔥 INDEX FILE RUNNING");

const express = require('express');
const cors = require('cors');
const { db } = require('./firebaseAdmin');

const app = express();

// ✅ Middleware FIRST — before anything else
app.use(cors());
app.use(express.json());

// ✅ Test routes
app.get('/', (req, res) => res.send('Backend is running 🚀'));

// ✅ Then routers
const pickupsRouter = require('./routes/pickups');
const impactRouter = require('./routes/impact');

app.use('/api/pickups', pickupsRouter);
app.use('/api/impact', impactRouter);

// ✅ Extra test routes
app.get('/test-db', async (req, res) => {
    try {
        await db.collection('test').doc('check').set({ working: true, time: new Date() });
        res.send("Firestore working ✅");
    } catch (e) {
        res.send("Firestore failed ❌ " + e.message);
    }
});

app.get('/create-test-pickup', async (req, res) => {
    try {
        await db.collection('pickups').doc('test123').set({
            status: "pending",
            assignedNgoId: null,
            createdAt: new Date()
        });
        res.send("Test pickup created ✅ ID: test123");
    } catch (e) {
        res.send("Error: " + e.message);
    }
});

console.log("FILE STARTED");

app.listen(4000, () => {
    console.log('Server running on port 4000');
});