const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const demoOverview = {
  conversations: { total: 48, active: 12, resolved: 26 },
  messages: { total: 326, byBot: 84, byAgent: 145, byContact: 97 }
};

const demoChannels = [{ _id: 'whatsapp', count: 48 }];
const demoTimeline = [
  { _id: '2026-04-01', count: 9 },
  { _id: '2026-04-02', count: 11 },
  { _id: '2026-04-03', count: 14 },
  { _id: '2026-04-04', count: 14 }
];

// @route   GET /api/analytics/overview
router.get('/overview', auth, async (req, res) => {
  try {
    res.json({ success: true, ...demoOverview, demo: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/channels
router.get('/channels', auth, async (req, res) => {
  try {
    res.json({ success: true, breakdown: demoChannels, demo: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/timeline
router.get('/timeline', auth, async (req, res) => {
  try {
    res.json({ success: true, timeline: demoTimeline, demo: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/export
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      return res.send('date,count\n2026-04-01,9\n2026-04-02,11\n2026-04-03,14\n2026-04-04,14');
    }

    res.json({ success: true, data: demoOverview, demo: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
