const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

router.get('/', async (req, res) => {
    try {
        const doc = await db.collection('impact').doc('global').get();

        if (!doc.exists) {
            return res.json({
                totalMeals: 0,
                totalKg: 0,
                co2Saved: 0
            });
        }

        res.json(doc.data());

    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

module.exports = router;