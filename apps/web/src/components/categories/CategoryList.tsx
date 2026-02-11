'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '@life-quest/types';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { CategoryCard } from './CategoryCard';

interface SortableCategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

function SortableCategoryCard({ category, onEdit }: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
    >
      <div
        {...attributes}
        {...listeners}
        className="mb-1 inline-block cursor-grab border-[2px] border-dashed border-zinc-600 px-2 py-1 font-body text-xs text-zinc-400 active:cursor-grabbing"
      >
        ⋮⋮ Drag
      </div>
      <CategoryCard category={category} onEdit={onEdit} />
    </div>
  );
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const reorderCategories = useCategoryStore((s) => s.reorderCategories);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    reorderCategories(newOrder.map((c) => c.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {categories.map((category) => (
            <SortableCategoryCard
              key={category.id}
              category={category}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
