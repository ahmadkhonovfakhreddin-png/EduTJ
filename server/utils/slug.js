export function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function uniqueSlug(prisma, base, model = 'center') {
  let slug = slugify(base) || 'center';
  let candidate = slug;
  let n = 0;
  while (true) {
    const exists =
      model === 'center'
        ? await prisma.center.findUnique({ where: { slug: candidate } })
        : null;
    if (!exists) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}
