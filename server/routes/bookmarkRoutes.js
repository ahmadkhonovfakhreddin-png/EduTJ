import { Router } from 'express';
import { param } from 'express-validator';
import * as bookmarks from '../controllers/bookmarkController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, bookmarks.listBookmarks);
router.post(
  '/:centerId',
  authenticate,
  [param('centerId').notEmpty()],
  handleValidation,
  bookmarks.toggleBookmark
);

export default router;
