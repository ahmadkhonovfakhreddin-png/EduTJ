import { prisma } from '../lib/prisma.js';

export async function toggleBookmark(req, res, next) {
  try {
    const { centerId } = req.params;
    const center = await prisma.center.findUnique({ where: { id: centerId } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_centerId: { userId: req.user.id, centerId },
      },
    });
    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return res.json({ bookmarked: false });
    }
    await prisma.bookmark.create({
      data: { userId: req.user.id, centerId },
    });
    res.json({ bookmarked: true });
  } catch (e) {
    next(e);
  }
}

export async function listBookmarks(req, res, next) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        center: {
          include: {
            courses: { take: 3, select: { category: true, title: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });
    const enriched = bookmarks.map((b) => {
      const c = b.center;
      const ratings = c.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, x) => a + x, 0) / ratings.length : 0;
      const { reviews: _rev, ...centerRest } = c;
      return {
        ...b,
        center: {
          ...centerRest,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
        },
      };
    });
    res.json({ bookmarks: enriched });
  } catch (e) {
    next(e);
  }
}
