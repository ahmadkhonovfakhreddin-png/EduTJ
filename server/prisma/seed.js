import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  await prisma.review.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.course.deleteMany();
  await prisma.center.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p) => bcrypt.hash(p, 10);

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@edutj.com',
      password: await hash('admin123'),
      role: 'ADMIN',
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: 'Center Owner',
      email: 'owner@edutj.com',
      password: await hash('owner123'),
      role: 'CENTER_OWNER',
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Student User',
      email: 'student@edutj.com',
      password: await hash('student123'),
      role: 'STUDENT',
    },
  });

  const r1 = await prisma.user.create({
    data: {
      name: 'Farzona Karimova',
      email: 'reviewer1@edutj.com',
      password: await hash('review123'),
      role: 'STUDENT',
    },
  });

  const r2 = await prisma.user.create({
    data: {
      name: 'Jamshed Nazarov',
      email: 'reviewer2@edutj.com',
      password: await hash('review123'),
      role: 'STUDENT',
    },
  });

  const reviewers = [student, r1, r2];

  const centersSpec = [
    {
      name: 'Oxford Tajik Academy',
      city: 'Dushanbe',
      verified: true,
      desc: 'Premier test prep and English programs with experienced international faculty.',
    },
    {
      name: 'Silk Road English Hub',
      city: 'Khujand',
      verified: true,
      desc: 'IELTS, general English, and conversation clubs in the Fergana Valley.',
    },
    {
      name: 'CodeStep Dushanbe',
      city: 'Dushanbe',
      verified: false,
      desc: 'Full-stack web development, Python, and computer science fundamentals.',
    },
    {
      name: 'MathSphere Institute',
      city: 'Bokhtar',
      verified: true,
      desc: 'Olympiad mathematics, calculus, and STEM tutoring for all ages.',
    },
    {
      name: 'PixelCraft Design School',
      city: 'Kulob',
      verified: false,
      desc: 'UI/UX, graphic design, and digital branding workshops.',
    },
    {
      name: 'SAT Masters Tajikistan',
      city: 'Dushanbe',
      verified: true,
      desc: 'Focused SAT and university admissions coaching with mock exams.',
    },
    {
      name: 'Khujand Business Academy',
      city: 'Khujand',
      verified: true,
      desc: 'MBA prep, entrepreneurship, and professional English for business.',
    },
    {
      name: 'Istaravshan STEM Lab',
      city: 'Istaravshan',
      verified: false,
      desc: 'Robotics, coding for kids, and science summer camps.',
    },
    {
      name: 'Fluent Futures Language Center',
      city: 'Bokhtar',
      verified: true,
      desc: 'Russian, English, and Tajik language courses for professionals.',
    },
    {
      name: 'Kulob Creative Coding',
      city: 'Kulob',
      verified: true,
      desc: 'Game development, JavaScript, and mobile app intro courses.',
    },
  ];

  const courseTemplates = [
    { title: 'SAT Intensive Bootcamp', category: 'SAT_PREP', price: 1200, duration: '8 weeks', schedule: 'Mon–Thu 17:00' },
    { title: 'IELTS Academic', category: 'ENGLISH', price: 900, duration: '10 weeks', schedule: 'Tue/Thu 18:30' },
    { title: 'Web Development Fundamentals', category: 'CODING', price: 850, duration: '12 weeks', schedule: 'Sat 10:00' },
    { title: 'Calculus & Algebra', category: 'MATHEMATICS', price: 600, duration: '6 weeks', schedule: 'Mon/Wed 16:00' },
    { title: 'UI/UX Fundamentals', category: 'DESIGN', price: 750, duration: '8 weeks', schedule: 'Fri 15:00' },
    { title: 'Business Communication', category: 'BUSINESS', price: 500, duration: '4 weeks', schedule: 'Wed 19:00' },
    { title: 'Python for Beginners', category: 'CODING', price: 700, duration: '8 weeks', schedule: 'Sun 11:00' },
    { title: 'Creative Writing', category: 'OTHER', price: 350, duration: '6 weeks', schedule: 'Thu 17:00' },
  ];

  let idx = 0;
  for (const spec of centersSpec) {
    const slug = slugify(spec.name);
    const logoId = 100 + idx;
    const coverId = 200 + idx;
    const center = await prisma.center.create({
      data: {
        name: spec.name,
        slug,
        description: spec.desc,
        city: spec.city,
        address: `${spec.city} Center, ${10 + idx} Rudaki Ave`,
        phone: `+992 90 ${200 + idx} 00 00`,
        email: `info@${slug}.tj`,
        website: `https://${slug}.example.tj`,
        logo: `https://picsum.photos/seed/edutjlogo${idx}/120/120`,
        coverImage: `https://picsum.photos/seed/edutjcover${idx}/1200/400`,
        isVerified: spec.verified,
        ownerId: owner.id,
      },
    });

    const nCourses = 3 + (idx % 3);
    for (let c = 0; c < nCourses; c++) {
      const t = courseTemplates[(idx + c) % courseTemplates.length];
      await prisma.course.create({
        data: {
          title: `${t.title} (${spec.city})`,
          description: `Hands-on ${t.title} at ${spec.name}. Small groups and certified instructors.`,
          category: t.category,
          price: t.price + idx * 10,
          duration: t.duration,
          schedule: t.schedule,
          centerId: center.id,
        },
      });
    }

    for (let r = 0; r < 3; r++) {
      const user = reviewers[r];
      const rating = 4 + (idx + r) % 2;
      await prisma.review.create({
        data: {
          rating,
          comment:
            r === 0
              ? `Great experience at ${spec.name}. Professional staff and clear curriculum.`
              : r === 1
                ? `Good value and convenient schedule in ${spec.city}. Recommended.`
                : `Helped me reach my goals. The instructors really care about students.`,
          userId: user.id,
          centerId: center.id,
        },
      });
    }

    idx += 1;
  }

  const oxford = await prisma.center.findUnique({ where: { slug: 'oxford-tajik-academy' } });
  if (oxford) {
    await prisma.bookmark.create({
      data: { userId: student.id, centerId: oxford.id },
    });
  }

  console.log('Seed completed: users (admin, owner, student + 2 reviewers), 10 centers, courses, reviews.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
