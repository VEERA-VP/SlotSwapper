import express from 'express';
import Event, { EventStatus } from '../models/Event.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const events = await Event.find({ userId: req.user.id }).sort({ startTime: 1 });
  res.json({ events });
});

router.post('/', async (req, res) => {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ error: 'Missing fields' });
  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({ error: 'endTime must be after startTime' });
  }
  const ev = await Event.create({
    title,
    startTime,
    endTime,
    status: status || EventStatus.BUSY,
    userId: req.user.id
  });
  res.status(201).json({ event: ev });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  if (update.startTime && update.endTime) {
    if (new Date(update.endTime) <= new Date(update.startTime)) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }
  }
  const ev = await Event.findOneAndUpdate({ _id: id, userId: req.user.id }, update, { new: true });
  if (!ev) return res.status(404).json({ error: 'Not found' });
  res.json({ event: ev });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const ok = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
