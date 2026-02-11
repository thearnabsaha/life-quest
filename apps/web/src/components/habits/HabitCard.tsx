'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Pencil, Trash2, Check, X, ChevronRight, FolderOpen, MessageSquare } from 'lucide-react';
import type { Habit } from '@life-quest/types';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { StreakCounter } from './StreakCounter';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string; // YYYY-MM-DD
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, selectedDate, onEdit }: HabitCardProps) {
  const [hoursInput, setHoursInput] = useState('');
  const [manualXpInput, setManualXpInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState(habit.comment || '');
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { completeHabit, uncompleteHabit, deleteHabit, updateHabit } = useHabitStore();
  const { categories } = useCategoryStore();

  useEffect(() => {
    if (editingComment && commentRef.current) {
      commentRef.current.focus();
      commentRef.current.setSelectionRange(commentRef.current.value.length, commentRef.current.value.length);
    }
  }, [editingComment]);

  const saveComment = async () => {
    setEditingComment(false);
    const trimmed = commentDraft.trim();
    if (trimmed !== (habit.comment || '')) {
      try {
        await updateHabit(habit.id, { comment: trimmed || null });
      } catch { /* handled */ }
    }
  };

  const breadcrumb = useMemo(() => {
    if (!habit.categoryId) return null;
    const cat = categories.find((c) => c.id === habit.categoryId);
    if (!cat) return null;
    const sub = habit.subCategoryId
      ? cat.subCategories?.find((s) => s.id === habit.subCategoryId)
      : null;
    return { category: cat, subCategory: sub };
  }, [habit.categoryId, habit.subCategoryId, categories]);

  const completion = habit.completions?.find(
    (c) => c.date === selectedDate && c.completed
  );
  const isCompleted = !!completion;

  const handleCompleteYesNo = async () => {
    if (isCompleted) return;
    try {
      await completeHabit(habit.id, selectedDate);
    } catch { /* handled */ }
  };

  const handleUncomplete = async () => {
    if (!isCompleted) return;
    try {
      await uncompleteHabit(habit.id, selectedDate);
    } catch { /* handled */ }
  };

  const handleCompleteHours = async () => {
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours <= 0) return;
    try {
      await completeHabit(habit.id, selectedDate, hours);
      setHoursInput('');
    } catch { /* handled */ }
  };

  const handleCompleteManual = async () => {
    const xp = parseInt(manualXpInput, 10);
    if (isNaN(xp) || xp <= 0) return;
    try {
      await completeHabit(habit.id, selectedDate, xp);
      setManualXpInput('');
    } catch { /* handled */ }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id);
      setShowDeleteConfirm(false);
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="border-[3px] p-5 theme-transition"
      style={{
        borderColor: 'var(--color-border-accent)',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--color-shadow)',
      }}
    >
      {/* Header: name, type, XP, breadcrumb */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-body text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {habit.name}
          </h3>
          <div className="mt-1 flex items-center gap-3">
            <span
              className="border-[2px] px-2 py-0.5 font-mono text-xs"
              style={{
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-muted)',
                boxShadow: '2px 2px 0px 0px var(--color-border)',
              }}
            >
              {habit.type === 'YES_NO' ? 'YES/NO' : habit.type === 'HOURS' ? 'HOURS' : 'MANUAL'}
            </span>
            <span className="font-body text-xs" style={{ color: 'var(--color-accent)' }}>
              +{habit.xpReward} XP
            </span>
          </div>
          {breadcrumb && (
            <div className="mt-2 flex items-center gap-1 text-[10px] font-body">
              <FolderOpen className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-accent)' }}>
                {breadcrumb.category.icon || '📁'} {breadcrumb.category.name}
              </span>
              {breadcrumb.subCategory && (
                <>
                  <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-border-subtle)' }} />
                  <span style={{ color: 'var(--color-accent-2, var(--color-accent))' }}>
                    {breadcrumb.subCategory.name}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="border-[2px] p-2 transition-all"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              boxShadow: '3px 3px 0px 0px var(--color-accent)',
            }}
            aria-label="Edit habit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-[2px] p-2 transition-all text-red-400"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-elevated)',
              boxShadow: '3px 3px 0px 0px #ff2d95',
            }}
            aria-label="Delete habit"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Streak */}
      <div className="mb-4">
        <StreakCounter count={habit.streak} />
      </div>

      {/* Comment / Note */}
      <div className="mb-4">
        {editingComment ? (
          <div className="space-y-2">
            <textarea
              ref={commentRef}
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onBlur={saveComment}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveComment();
                }
                if (e.key === 'Escape') {
                  setCommentDraft(habit.comment || '');
                  setEditingComment(false);
                }
              }}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-3 py-2 text-sm font-body rounded-sm resize-none focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-accent)',
                color: 'var(--color-text-primary)',
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setCommentDraft(habit.comment || '');
                  setEditingComment(false);
                }}
                className="px-2 py-0.5 text-xs font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveComment}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded-sm"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg-base)',
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCommentDraft(habit.comment || '');
              setEditingComment(true);
            }}
            className="w-full text-left group/comment"
          >
            {habit.comment ? (
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-sm text-sm font-body transition-all"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <MessageSquare
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  style={{ color: 'var(--color-accent)' }}
                />
                <span
                  className="whitespace-pre-wrap break-words"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {habit.comment}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <MessageSquare className="h-3 w-3" />
                Add note...
              </div>
            )}
          </button>
        )}
      </div>

      {/* Completion area */}
      {habit.type === 'YES_NO' ? (
        <div className="flex gap-2">
          {/* Complete / Undo button */}
          <button
            type="button"
            onClick={isCompleted ? handleUncomplete : handleCompleteYesNo}
            className={`flex flex-1 items-center justify-center gap-2 border-[2px] py-4 font-body text-sm font-bold uppercase tracking-wider transition-all ${
              isCompleted ? 'text-black' : ''
            }`}
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: isCompleted ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: isCompleted ? '#000' : 'var(--color-text-primary)',
              boxShadow: isCompleted
                ? '4px 4px 0px 0px var(--color-border-accent)'
                : 'var(--color-shadow)',
            }}
          >
            {isCompleted ? (
              <>
                <Check className="h-5 w-5" /> Done
              </>
            ) : (
              'Complete'
            )}
          </button>
          {isCompleted && (
            <button
              type="button"
              onClick={handleUncomplete}
              className="border-[2px] px-3 py-4 transition-all text-red-400"
              style={{
                borderColor: 'var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-elevated)',
              }}
              title="Undo completion"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : habit.type === 'MANUAL' ? (
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <div
                className="flex flex-1 items-center justify-center gap-2 border-[2px] py-4 font-body text-sm font-bold"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#000',
                }}
              >
                <Check className="h-4 w-4" />
                Logged {completion.xpAwarded} XP
              </div>
              <button
                type="button"
                onClick={handleUncomplete}
                className="border-[2px] px-3 py-4 transition-all text-red-400"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-elevated)',
                }}
                title="Undo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={manualXpInput}
                onChange={(e) => setManualXpInput(e.target.value)}
                placeholder="XP amount"
                className="flex-1 border-[2px] px-4 py-3 font-body focus:outline-none"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '3px 3px 0px 0px var(--color-border-accent)',
                }}
              />
              <button
                type="button"
                onClick={handleCompleteManual}
                disabled={!manualXpInput || parseInt(manualXpInput, 10) <= 0}
                className="border-[2px] px-6 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '4px 4px 0px 0px var(--color-border-accent)',
                }}
              >
                LOG XP
              </button>
            </div>
          )}
        </div>
      ) : (
        /* HOURS type */
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <div
                className="flex flex-1 items-center justify-center gap-2 border-[2px] py-4 font-body text-sm font-bold"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#000',
                }}
              >
                <Check className="h-4 w-4" />
                Logged {completion.hoursLogged ?? 0} hrs ({completion.xpAwarded} XP)
              </div>
              <button
                type="button"
                onClick={handleUncomplete}
                className="border-[2px] px-3 py-4 transition-all text-red-400"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-elevated)',
                }}
                title="Undo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                max="999"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                placeholder="Hours"
                className="flex-1 border-[2px] px-4 py-3 font-body focus:outline-none"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '3px 3px 0px 0px var(--color-border-accent)',
                }}
              />
              <button
                type="button"
                onClick={handleCompleteHours}
                disabled={!hoursInput || parseFloat(hoursInput) <= 0}
                className="border-[2px] px-6 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '4px 4px 0px 0px var(--color-border-accent)',
                }}
              >
                Log
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm border-[3px] p-6"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: '8px 8px 0px 0px #ff2d95',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Delete &quot;{habit.name}&quot;? All progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-[2px] px-4 py-2 font-body text-sm font-semibold"
                style={{
                  borderColor: 'var(--color-border-accent)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '3px 3px 0px 0px var(--color-border-accent)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 border-[2px] border-red-500 bg-red-500 px-4 py-2 font-body text-sm font-semibold text-black"
                style={{ boxShadow: '3px 3px 0px 0px var(--color-border-accent)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
