import express from 'express';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth.js';
import Event, { EventStatus } from '../models/Event.js';
import SwapRequest, { SwapStatus } from '../models/SwapRequest.js';

const router = express.Router();

/**
 * Return other users' swappable slots with owner name/email.
 */
router.get('/swappable-slots', auth, async (req, res) => {
  const slots = await Event.find({
    userId: { $ne: req.user.id },
    status: EventStatus.SWAPPABLE
  })
    .sort({ startTime: 1 })
    .populate('userId', 'name email'); // show owner
  res.json({ slots });
});

/**
 * List incoming/outgoing swap requests with populated user and slot details.
 */
router.get('/swap-requests/incoming', auth, async (req, res) => {
  const items = await SwapRequest.find({
    responderId: req.user.id,
    status: SwapStatus.PENDING
  })
    .populate('mySlotId theirSlotId')
    .populate('requesterId', 'name email')
    .populate('responderId', 'name email');
  res.json({ requests: items });
});

router.get('/swap-requests/outgoing', auth, async (req, res) => {
  const items = await SwapRequest.find({ requesterId: req.user.id })
    .populate('mySlotId theirSlotId')
    .populate('requesterId', 'name email')
    .populate('responderId', 'name email');
  res.json({ requests: items });
});

/**
 * Create swap request: lock both slots as SWAP_PENDING.
 */
router.post('/swap-request', auth, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) {
    return res.status(400).json({ error: 'Missing slot ids' });
  }

  const [mySlot, theirSlot] = await Promise.all([
    Event.findOne({ _id: mySlotId, userId: req.user.id }),
    Event.findById(theirSlotId)
  ]);

  if (!mySlot || !theirSlot) return res.status(404).json({ error: 'Slot not found' });
  if (String(theirSlot.userId) === String(req.user.id)) {
    return res.status(400).json({ error: 'Cannot request your own slot' });
  }
  if (mySlot.status !== EventStatus.SWAPPABLE || theirSlot.status !== EventStatus.SWAPPABLE) {
    return res.status(400).json({ error: 'Both slots must be SWAPPABLE' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const reqDoc = await SwapRequest.create(
      [{
        requesterId: req.user.id,
        responderId: theirSlot.userId,
        mySlotId,
        theirSlotId,
        status: SwapStatus.PENDING
      }],
      { session }
    );

    await Event.updateMany(
      { _id: { $in: [mySlotId, theirSlotId] } },
      { $set: { status: EventStatus.SWAP_PENDING } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ request: reqDoc[0] });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Swap request failed' });
  } finally {
    session.endSession();
  }
});

/**
 * Respond to swap request.
 * NOTE (updated): On accept, we **swap only the time ranges** of the two events.
 * - Titles stay with their original owners.
 * - Owners (userId) DO NOT change.
 * - Both statuses become BUSY.
 */
router.post('/swap-response/:requestId', auth, async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;

  const reqDoc = await SwapRequest.findById(requestId);
  if (!reqDoc) return res.status(404).json({ error: 'Request not found' });
  if (String(reqDoc.responderId) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Not authorized to respond' });
  }

  const [a, b] = await Promise.all([
    Event.findById(reqDoc.mySlotId),     // requester’s offered slot
    Event.findById(reqDoc.theirSlotId)   // responder’s slot requested
  ]);
  if (!a || !b) return res.status(404).json({ error: 'Slots missing' });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (!accept) {
      reqDoc.status = SwapStatus.REJECTED;
      await reqDoc.save({ session });
      await Event.updateMany(
        { _id: { $in: [a._id, b._id] } },
        { $set: { status: EventStatus.SWAPPABLE } },
        { session }
      );
      await session.commitTransaction();
      return res.json({ request: reqDoc });
    }

    // ACCEPT: swap ONLY start/end times (titles & owners remain)
    const aStart = a.startTime, aEnd = a.endTime;
    a.startTime = b.startTime;
    a.endTime = b.endTime;
    b.startTime = aStart;
    b.endTime = aEnd;

    a.status = EventStatus.BUSY;
    b.status = EventStatus.BUSY;

    await Promise.all([a.save({ session }), b.save({ session })]);

    reqDoc.status = SwapStatus.ACCEPTED;
    await reqDoc.save({ session });

    await session.commitTransaction();
    res.json({ request: reqDoc });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Swap response failed' });
  } finally {
    session.endSession();
  }
});

export default router;
