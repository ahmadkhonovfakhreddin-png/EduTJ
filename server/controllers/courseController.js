import { prisma } from '../lib/prisma.js';

function courseWhere(query) {
  const { category, centerId, city, search, minPrice, maxPrice } = query;
  const and = [];
  if (category && category !== 'all') {
    and.push({ category });
  }
  if (centerId) {
    and.push({ centerId });
  }
  if (city && city !== 'all') {
    and.push({ center: { city: { equals: city, mode: 'insensitive' } } });
  }
  if (search && String(search).trim()) {
    const q = String(search).trim();
    and.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (minPrice != null && !Number.isNaN(parseFloat(minPrice))) {
    and.push({ price: { gte: parseFloat(minPrice) } });
  }
  if (maxPrice != null && !Number.isNaN(parseFloat(maxPrice))) {
    and.push({ price: { lte: parseFloat(maxPrice) } });
  }
  return and.length ? { AND: and } : {};
}

export async function listCourses(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const where = courseWhere(req.query);
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          center: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              logo: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);
    res.json({
      courses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        center: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            logo: true,
            coverImage: true,
            isVerified: true,
          },
        },
      },
    });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course });
  } catch (e) {
    next(e);
  }
}

async function assertOwnerCourse(user, courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { center: true },
  });
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  if (course.center.ownerId !== user.id && user.role !== 'ADMIN') {
    const err = new Error('Not allowed');
    err.status = 403;
    throw err;
  }
  return course;
}

export async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, duration, schedule, centerId } = req.body;
    const center = await prisma.center.findUnique({ where: { id: centerId } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    if (center.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only add courses to your own center' });
    }
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        price: Number(price),
        duration,
        schedule,
        centerId,
      },
    });
    res.status(201).json({ course });
  } catch (e) {
    next(e);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    await assertOwnerCourse(req.user, id);
    const body = req.body;
    const data = {};
    for (const f of ['title', 'description', 'category', 'duration', 'schedule']) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.price !== undefined) data.price = Number(body.price);
    if (Object.keys(data).length === 0) {
      const course = await prisma.course.findUnique({ where: { id } });
      return res.json({ course });
    }
    const course = await prisma.course.update({
      where: { id },
      data,
    });
    res.json({ course });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    await assertOwnerCourse(req.user, id);
    await prisma.course.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
}
