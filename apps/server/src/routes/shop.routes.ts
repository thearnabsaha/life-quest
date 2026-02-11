import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', shopController.getShopItems);
router.post('/', shopController.createShopItem);
router.patch('/:id', shopController.updateShopItem);
router.delete('/:id', shopController.deleteShopItem);
router.post('/:id/purchase', shopController.purchaseItem);
router.post('/:id/refund', shopController.refundItem);
router.get('/history', shopController.getRedemptionHistory);

export default router;
