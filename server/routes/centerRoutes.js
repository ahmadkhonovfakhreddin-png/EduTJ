import { Router } from 'express';
import { body, param } from 'express-validator';
import * as centers from '../controllers/centerController.js';
import { authenticate, authenticateOptional, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.get('/', centers.listCenters);
router.get('/:slug', authenticateOptional, centers.getCenterBySlug);

router.post(
  '/',
  authenticate,
  requireRole('CENTER_OWNER', 'ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('phone').optional({ nullable: true }).isString(),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail(),
    body('website').optional({ nullable: true, checkFalsy: true }).isURL(),
    body('logo').optional({ nullable: true }).isString(),
    body('coverImage').optional({ nullable: true }).isString(),
  ],
  handleValidation,
  centers.createCenter
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('city').optional().trim().notEmpty(),
    body('address').optional().trim().notEmpty(),
  ],
  handleValidation,
  centers.updateCenter
);

router.delete('/:id', authenticate, centers.deleteCenter);

export default router;
