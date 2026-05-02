import { Router } from 'express';
import { body, param } from 'express-validator';
import * as reviews from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('centerId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().notEmpty(),
  ],
  handleValidation,
  reviews.createReview
);

router.delete('/:id', authenticate, [param('id').notEmpty()], handleValidation, reviews.deleteReview);

export default router;
