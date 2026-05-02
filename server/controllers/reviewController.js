import { prisma } from '../lib/prisma.js';

export async function createReview(req, res, next) {
  try {
    if (req.user.role !== 'STUDENT' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only students can post reviews' });
    }
    const { centerId, rating, comment } = req.body;
    const center = await prisma.center.findUnique({ where: { id: centerId } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    try {
      const review = await prisma.review.create({
        data: {
          rating: Number(rating),
          comment,
          userId: req.user.id,
          centerId,
        },
        include: { user: { select: { id: true, name: true } } },
      });
      res.status(201).json({ review });
    } catch (e) {
      if (e.code === 'P2002') {
        return res.status(409).json({ error: 'You already reviewed this center' });
      }
      throw e;
    }
  } catch (e) {
    next(e);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed to delete this review' });
    }
    await prisma.review.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
