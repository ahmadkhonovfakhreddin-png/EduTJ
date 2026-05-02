import { Router } from 'express';
import { body, param } from 'express-validator';
import * as courses from '../controllers/courseController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const categories = [
  'SAT_PREP',
  'ENGLISH',
  'CODING',
  'MATHEMATICS',
  'DESIGN',
  'BUSINESS',
  'OTHER',
];

router.get('/', courses.listCourses);
router.get('/:id', courses.getCourse);

router.post(
  '/',
  authenticate,
  requireRole('CENTER_OWNER', 'ADMIN'),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isIn(categories),
    body('price').isFloat({ min: 0 }),
    body('duration').trim().notEmpty(),
    body('schedule').trim().notEmpty(),
    body('centerId').notEmpty(),
  ],
  handleValidation,
  courses.createCourse
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').notEmpty(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('category').optional().isIn(categories),
    body('price').optional().isFloat({ min: 0 }),
    body('duration').optional().trim().notEmpty(),
    body('schedule').optional().trim().notEmpty(),
  ],
  handleValidation,
  courses.updateCourse
);

router.delete('/:id', authenticate, courses.deleteCourse);

export default router;
