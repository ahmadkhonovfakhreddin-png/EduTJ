import { prisma } from '../lib/prisma.js';
import { uniqueSlug } from '../utils/slug.js';

const MAX_LIST = 500;

function buildCenterWhere(query) {
  const { city, category, search } = query;
  const and = [];
  if (city && city !== 'all') {
    and.push({ city: { equals: city, mode: 'insensitive' } });
  }
  if (category && category !== 'all') {
    and.push({
      courses: { some: { category } },
    });
  }
  if (search && String(search).trim()) {
    const q = String(search).trim();
    and.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

function enrichCenter(c) {
  const ratings = c.reviews?.map((r) => r.rating) ?? [];
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const topCategories = [...new Set((c.courses ?? []).map((co) => co.category))].slice(0, 4);
  const { reviews, ...rest } = c;
  return {
    ...rest,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: ratings.length,
    topCategories,
  };
}

export async function listCenters(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const sort = req.query.sort || 'newest';
    const minRating = req.query.minRating != null ? parseFloat(req.query.minRating) : null;
    const maxPrice = req.query.maxPrice != null ? parseFloat(req.query.maxPrice) : null;

    let where = buildCenterWhere(req.query);

    if (maxPrice != null && !Number.isNaN(maxPrice)) {
      const priceClause = { courses: { some: { price: { lte: maxPrice } } } };
      if (Object.keys(where).length === 0) {
        where = priceClause;
      } else if (where.AND) {
        where = { AND: [...where.AND, priceClause] };
      } else {
        where = { AND: [where, priceClause] };
      }
    }

    const raw = await prisma.center.findMany({
      where,
      take: MAX_LIST,
      include: {
        courses: { select: { category: true, title: true, price: true }, take: 5 },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, bookmarks: true } },
      },
    });

    let list = raw.map(enrichCenter);
    if (minRating != null && !Number.isNaN(minRating)) {
      list = list.filter((c) => c.avgRating >= minRating);
    }

    if (sort === 'rating') {
      list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    } else if (sort === 'reviews') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);
    res.json({
      centers: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

export async function getCenterBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const center = await prisma.center.findUnique({
      where: { slug },
      include: {
        courses: { orderBy: { createdAt: 'desc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    await prisma.center.update({
      where: { id: center.id },
      data: { viewCount: { increment: 1 } },
    });

    const ratings = center.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const bookmarked =
      req.user &&
      (await prisma.bookmark.findUnique({
        where: {
          userId_centerId: { userId: req.user.id, centerId: center.id },
        },
      }));

    res.json({
      center: {
        ...center,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
        bookmarked: !!bookmarked,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createCenter(req, res, next) {
  try {
    const body = req.body;
    const slug = await uniqueSlug(prisma, body.slug || body.name);
    const center = await prisma.center.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        city: body.city,
        address: body.address,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        logo: body.logo || null,
        coverImage: body.coverImage || null,
        ownerId: req.user.id,
      },
    });
    res.status(201).json({ center });
  } catch (e) {
    next(e);
  }
}

export async function updateCenter(req, res, next) {
  try {
    const { id } = req.params;
    const center = await prisma.center.findUnique({ where: { id } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    if (center.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed to update this center' });
    }
    const body = req.body;
    const data = {};
    const fields = [
      'name',
      'description',
      'city',
      'address',
      'phone',
      'email',
      'website',
      'logo',
      'coverImage',
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.slug && req.user.role === 'ADMIN') {
      data.slug = body.slug;
    }
    if (Object.keys(data).length === 0) {
      return res.json({ center });
    }
    const updated = await prisma.center.update({
      where: { id },
      data,
    });
    res.json({ center: updated });
  } catch (e) {
    next(e);
  }
}

export async function deleteCenter(req, res, next) {
  try {
    const { id } = req.params;
    const center = await prisma.center.findUnique({ where: { id } });
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    if (center.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed to delete this center' });
    }
    await prisma.center.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
