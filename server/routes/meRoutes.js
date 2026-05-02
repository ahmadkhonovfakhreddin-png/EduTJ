import { Router } from 'express';
import * as owner from '../controllers/ownerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/reviews', owner.myReviews);
router.get('/center-dashboard', owner.myCenterDashboard);

export default router;
