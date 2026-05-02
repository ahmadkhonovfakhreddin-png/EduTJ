import { prisma } from '../lib/prisma.js';

export async function listCentersAdmin(req, res, next) {
  try {
    const centers = await prisma.center.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { courses: true, reviews: true, bookmarks: true } },
      },
    });
    res.json({ centers });
  } catch (e) {
    next(e);
  }
}

export async function verifyCenter(req, res, next) {
  try {
    const { id } = req.params;
    const center = await prisma.center.findUnique({ where: { id } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    const updated = await prisma.center.update({
      where: { id },
      data: { isVerified: true },
    });
    res.json({ center: updated });
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { centers: true, reviews: true, bookmarks: true } },
      },
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
}

export async function stats(req, res, next) {
  try {
    const [users, centers, courses, reviews, verifiedCenters] = await Promise.all([
      prisma.user.count(),
      prisma.center.count(),
      prisma.course.count(),
      prisma.review.count(),
      prisma.center.count({ where: { isVerified: true } }),
    ]);
    res.json({
      users,
      centers,
      courses,
      reviews,
      verifiedCenters,
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteCenterAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const center = await prisma.center.findUnique({ where: { id } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    await prisma.center.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
