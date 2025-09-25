// @ts-nocheck
/* eslint-env node */
'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * Promovează un user existent la 'prof'
 * PATCH /api/admin/users/:id/role  { "role": "prof" }
 */
router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const role = req.body.role;
    if (!['student','prof','admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.role = role;
    if (role !== 'student') u.active = true;
    await u.save();
    res.json({ _id: u._id, email: u.email, role: u.role, active: u.active, name: u.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * Creează direct un cont 'prof'
 * POST /api/admin/users/create-prof { email, password, name? }
 */
router.post('/create-prof', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();
    const name = req.body.name || 'Profesor';

    if (!email || !password) return res.status(400).json({ error: 'email și password sunt obligatorii' });

    let u = await User.findOne({ email });
    const hash = await bcrypt.hash(password, 10);

    if (!u) {
      u = await User.create({ email, password: hash, role: 'prof', active: true, name });
    } else {
      u.role = 'prof';
      u.active = true;
      if (password) u.password = hash;
      if (name && !u.name) u.name = name;
      await u.save();
    }

    res.json({ _id: u._id, email: u.email, role: u.role, active: u.active, name: u.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * (Opțional) caută user după email ca să-i afli _id
 * GET /api/admin/users/find?email=...
 */
router.get('/find', requireAuth, requireRole('admin'), async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email required' });
  const u = await User.findOne({ email }).select('_id email role active name');
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

module.exports = router;