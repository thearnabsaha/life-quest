import type { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

export async function getUserCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const categories = await categoryService.getUserCategories(userId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { name, icon, color } = req.body;
    if (!name) {
      res.status(400).json({ message: 'name is required' });
      return;
    }
    const category = await categoryService.createCategory(userId, {
      name,
      icon,
      color,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { name, icon, color } = req.body;
    const category = await categoryService.updateCategory(userId, id, {
      name,
      icon,
      color,
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    await categoryService.deleteCategory(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function reorderCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds)) {
      res.status(400).json({ message: 'categoryIds array is required' });
      return;
    }
    const categories = await categoryService.reorderCategories(userId, categoryIds);
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function createSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const categoryId = req.params.categoryId as string;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'name is required' });
      return;
    }
    const subCategory = await categoryService.createSubCategory(
      userId,
      categoryId,
      { name }
    );
    res.status(201).json(subCategory);
  } catch (error) {
    next(error);
  }
}

export async function updateSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { name } = req.body;
    const subCategory = await categoryService.updateSubCategory(userId, id, {
      name,
    });
    res.json(subCategory);
  } catch (error) {
    next(error);
  }
}

export async function deleteSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    await categoryService.deleteSubCategory(userId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
