import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', categoryController.getUserCategories);
router.post('/', categoryController.createCategory);
router.patch('/reorder', categoryController.reorderCategories);
router.post('/:categoryId/subcategories', categoryController.createSubCategory);
router.patch('/subcategories/:id', categoryController.updateSubCategory);
router.delete('/subcategories/:id', categoryController.deleteSubCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
