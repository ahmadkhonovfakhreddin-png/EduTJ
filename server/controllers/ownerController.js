import { prisma } from '../lib/prisma.js';

export async function myCenterDashboard(req, res, next) {
  try {
    if (req.user.role !== 'CENTER_OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Center owners only' });
    }
    const centers = await prisma.center.findMany({
      where: { ownerId: req.user.id },
      include: {
        courses: { orderBy: { createdAt: 'desc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { bookmarks: true, reviews: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!centers.length) {
      return res.status(404).json({ error: 'No center found. Create one first.' });
    }
    const totals = {
      viewCount: centers.reduce((a, c) => a + c.viewCount, 0),
      bookmarks: centers.reduce((a, c) => a + c._count.bookmarks, 0),
      reviews: centers.reduce((a, c) => a + c._count.reviews, 0),
    };
    res.json({ centers, totals });
  } catch (e) {
    next(e);
  }
}

export async function myReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        center: { select: { id: true, name: true, slug: true, city: true, logo: true } },
      },
    });
    res.json({ reviews });
  } catch (e) {
    next(e);
  }
}
