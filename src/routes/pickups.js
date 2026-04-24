console.log("🔥 PICKUPS ROUTE LOADED");

const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

console.log("🔥 NEW CLEAN PICKUPS FILE RUNNING");


// 🔥 DEBUG MIDDLEWARE (THIS MUST COME AFTER router is created)
router.use((req, res, next) => {
    console.log("🔥 ROUTER ACTIVE:", req.method, req.url);
    next();
});


// =========================
// POST /api/pickups
// =========================
router.post('/', async (req, res) => {
    console.log("🚀 POST /api/pickups HIT");

    try {
        const { pickupId } = req.body || {};

        if (!pickupId) {
            return res.status(400).json({
                success: false,
                message: "pickupId is required"
            });
        }

        const pickupDoc = await db.collection('pickups').doc(pickupId).get();
        const pickup = pickupDoc.data();

        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: "Pickup not found"
            });
        }

        res.json({
            success: true,
            message: "Pickup fetched successfully"
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});


// =========================
// PATCH /api/pickups/:id/claim
// =========================
router.patch('/:id/claim', async (req, res) => {
    console.log("🔥 CLAIM API HIT");

    try {
        const { ngoId } = req.body || {};

        if (!ngoId) {
            return res.status(400).json({
                success: false,
                message: "ngoId is required"
            });
        }

        const pickupRef = db.collection('pickups').doc(req.params.id);

        await db.runTransaction(async (t) => {
            const doc = await t.get(pickupRef);

            if (!doc.exists) throw new Error('Pickup not found');
            if (doc.data().status !== 'pending') throw new Error('Already claimed');

            t.update(pickupRef, {
                status: 'claimed',
                assignedNgoId: ngoId,
                claimedAt: new Date()
            });
        });

        res.json({
            success: true,
            message: "Pickup claimed successfully"
        });

    } catch (e) {
        res.status(409).json({
            success: false,
            message: e.message
        });
    }
});


// =========================
// PATCH /api/pickups/:id/complete
// =========================
router.patch('/:id/complete', async (req, res) => {
    console.log("🔥 COMPLETE API HIT");

    try {
        const pickupRef = db.collection('pickups').doc(req.params.id);
        const doc = await pickupRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "Pickup not found"
            });
        }

        await pickupRef.update({
            status: 'completed',
            completedAt: new Date()
        });

        res.json({
            success: true,
            message: "Pickup completed successfully"
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});

module.exports = router;