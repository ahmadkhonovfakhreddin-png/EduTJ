import { Router } from 'express';
import { param } from 'express-validator';
import * as admin from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/centers', admin.listCentersAdmin);
router.put(
  '/centers/:id/verify',
  [param('id').notEmpty()],
  handleValidation,
  admin.verifyCenter
);
router.delete(
  '/centers/:id',
  [param('id').notEmpty()],
  handleValidation,
  admin.deleteCenterAdmin
);
router.get('/users', admin.listUsers);
router.get('/stats', admin.stats);
router.delete('/users/:id', [param('id').notEmpty()], handleValidation, admin.deleteUser);

export default router;
