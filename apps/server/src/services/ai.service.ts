import Groq from 'groq-sdk';
import { env } from '../config/env';
import { readDb } from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import * as categoryService from './category.service';
import * as habitService from './habit.service';
import * as goalService from './goal.service';
import * as xpService from './xp.service';
import type { HabitType, GoalType } from '@life-quest/types';

// ===== Groq Client =====
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// ===== Model Fallback Chain =====
const MODELS = [
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
  'llama-3.1-8b-instant',
] as const;

// ===== Rate Limiting =====
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 20;
const MAX_MESSAGE_LENGTH = 500;
const MAX_ACTIONS_PER_MESSAGE = 10;

function checkRateLimit(userId: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    throw new AppError(429, 'AI rate limit exceeded. Try again in a minute.');
  }
  entry.count++;
}

// ===== Types =====
interface AIAction {
  type: 'create_category' | 'create_habit' | 'complete_habit' | 'create_goal' | 'log_xp';
  name?: string;
  categoryName?: string;
  subCategories?: string[];
  subCategoryName?: string;
  icon?: string;
  color?: string;
  habitType?: string;
  xpReward?: number;
  amount?: number;
  source?: string;
  goalType?: string;
  targetValue?: number;
  deadline?: string;
  description?: string;
  hoursLogged?: number;
}

interface AIResponse {
  response: string;
  actions: AIAction[];
  needs_clarification: boolean;
  clarification_question: string | null;
}

interface ActionResult {
  type: string;
  success: boolean;
  detail: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ===== System Prompt Builder =====
function buildSystemPrompt(userId: string): string {
  const db = readDb();
  const categories = db.categories.filter((c) => c.userId === userId);
  const subCategories = db.subCategories;
  const habits = db.habits.filter((h) => h.userId === userId && h.isActive);
  const goals = db.goals.filter((g) => g.userId === userId && g.status === 'ACTIVE');
  const profile = db.profiles.find((p) => p.userId === userId);

  const catData = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    subCategories: subCategories
      .filter((s) => s.categoryId === c.id)
      .map((s) => ({ id: s.id, name: s.name })),
  }));

  const habitData = habits.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    xpReward: h.xpReward,
    streak: h.streak,
    categoryId: h.categoryId,
    subCategoryId: h.subCategoryId,
  }));

  const goalData = goals.map((g) => ({
    id: g.id,
    title: g.title,
    type: g.type,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    xpReward: g.xpReward,
  }));

  return `You are the AI assistant for Life Quest, a life-gamification RPG app. You help users manage their habits, categories, challenges, and XP.

CURRENT USER CONTEXT:
- Profile: Level ${profile?.level ?? 1}, ${profile?.totalXP ?? 0} XP, Rank ${profile?.rank ?? 'E'}
- Categories: ${JSON.stringify(catData)}
- Active Habits: ${JSON.stringify(habitData)}
- Active Challenges: ${JSON.stringify(goalData)}

YOUR CAPABILITIES (actions you can take):
1. create_category: Create a category with optional subcategories, icon, color
2. create_habit: Create a habit linked to a category/subcategory  
3. complete_habit: Mark a habit as done for today (fuzzy match by name)
4. create_goal: Create a challenge (SHORT_TERM or LONG_TERM)
5. log_xp: Log manual XP to a category

IMPORTANT - ASK BEFORE CREATING:
When the user asks you to create habits, challenges, or categories, you MUST ask them the following details if they haven't already provided them:
- For habits: "How much XP should this habit reward? What type should it be (Yes/No, Hours tracked, or Manual XP)? Which category/subcategory does it belong to?"
- For challenges: "How much XP should completing this challenge reward? What's the target value? Is it short-term or long-term? Any deadline?"
- For categories: "What icon (emoji) and color should I use? Any subcategories to add?"
Set needs_clarification to true and ask a CONCISE question covering ALL missing info in one go. DO NOT create anything without knowing the XP reward.
The ONLY exception is when completing habits -- just do it immediately.

RULES:
- Always respond in JSON format with this exact structure:
{
  "response": "friendly message to the user about what you did or need",
  "actions": [array of action objects],
  "needs_clarification": false,
  "clarification_question": null
}
- If you need more info, set needs_clarification to true and ask in clarification_question. Put NO actions when clarifying.
- When completing habits, fuzzy-match the habit name from the user's existing habits list. Use the habit ID.
- When creating habits, always try to link them to an existing category. If no matching category exists, create the category first.
- For create_category actions: { "type": "create_category", "name": "...", "icon": "emoji", "color": "neonGreen|neonPink|neonBlue|neonYellow|neonPurple", "subCategories": ["sub1", "sub2"] }
- For create_habit actions: { "type": "create_habit", "name": "...", "categoryName": "...", "subCategoryName": "...", "habitType": "YES_NO"|"HOURS"|"MANUAL", "xpReward": 10 }
- For complete_habit actions: { "type": "complete_habit", "name": "habit name to fuzzy match", "hoursLogged": optional_number }
- For create_goal actions: { "type": "create_goal", "name": "...", "goalType": "SHORT_TERM"|"LONG_TERM", "targetValue": number, "xpReward": number, "categoryName": "...", "deadline": "YYYY-MM-DD", "description": "..." }
- For log_xp actions: { "type": "log_xp", "amount": number, "categoryName": "...", "source": "reason" }
- Max ${MAX_ACTIONS_PER_MESSAGE} actions per response.
- NEVER modify XP formulas, rulebook settings, or delete anything.
- Be concise, friendly, and game-themed in your responses. Use RPG language.
- If the user says they did multiple things, create multiple complete_habit or log_xp actions.
- When the user provides all required info (especially XP amounts), proceed to create immediately without further questions.`;
}

// ===== Call Groq with Fallback =====
async function callGroq(
  messages: ChatMessage[],
  modelIndex: number = 0
): Promise<{ content: string; model: string }> {
  if (modelIndex >= MODELS.length) {
    throw new AppError(503, 'All AI models are rate-limited. Please try again later.');
  }

  const model = MODELS[modelIndex];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      model,
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AppError(500, 'Empty response from AI');
    }

    return { content, model };
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      console.log(`Model ${model} rate-limited, falling back...`);
      return callGroq(messages, modelIndex + 1);
    }
    throw error;
  }
}

// ===== Parse AI Response =====
function parseAIResponse(raw: string): AIResponse {
  try {
    const parsed = JSON.parse(raw);
    return {
      response: String(parsed.response ?? 'Done.'),
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, MAX_ACTIONS_PER_MESSAGE) : [],
      needs_clarification: Boolean(parsed.needs_clarification),
      clarification_question: parsed.clarification_question ?? null,
    };
  } catch {
    return {
      response: raw.slice(0, 300),
      actions: [],
      needs_clarification: false,
      clarification_question: null,
    };
  }
}

// ===== Execute Actions =====
async function executeActions(userId: string, actions: AIAction[]): Promise<ActionResult[]> {
  const results: ActionResult[] = [];
  const db = readDb();

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'create_category': {
          const cat = await categoryService.createCategory(userId, {
            name: action.name ?? 'New Category',
            icon: action.icon,
            color: action.color,
          });
          // Create subcategories if specified
          if (action.subCategories && action.subCategories.length > 0) {
            for (const subName of action.subCategories) {
              await categoryService.createSubCategory(userId, cat.id, { name: subName });
            }
          }
          const subList = action.subCategories?.length
            ? ` with subcategories: ${action.subCategories.join(', ')}`
            : '';
          results.push({ type: 'create_category', success: true, detail: `Created category "${cat.name}"${subList}` });
          break;
        }

        case 'create_habit': {
          // Find or match category
          let categoryId: string | null = null;
          let subCategoryId: string | null = null;
          const freshDb = readDb();

          if (action.categoryName) {
            const cats = freshDb.categories.filter((c) => c.userId === userId);
            const match = cats.find((c) =>
              c.name.toLowerCase() === action.categoryName!.toLowerCase()
            );
            if (match) {
              categoryId = match.id;
              if (action.subCategoryName) {
                const subs = freshDb.subCategories.filter((s) => s.categoryId === match.id);
                const subMatch = subs.find((s) =>
                  s.name.toLowerCase() === action.subCategoryName!.toLowerCase()
                );
                if (subMatch) subCategoryId = subMatch.id;
              }
            }
          }

          const habitType = (['YES_NO', 'HOURS', 'MANUAL'].includes(action.habitType ?? '')
            ? action.habitType
            : 'YES_NO') as HabitType;

          const habit = await habitService.createHabit(userId, {
            name: action.name ?? 'New Habit',
            type: habitType,
            xpReward: action.xpReward ?? 10,
            categoryId,
            subCategoryId,
          });
          results.push({ type: 'create_habit', success: true, detail: `Created habit "${habit.name}" (+${habit.xpReward} XP)` });
          break;
        }

        case 'complete_habit': {
          const freshDb2 = readDb();
          const userHabits = freshDb2.habits.filter((h) => h.userId === userId && h.isActive);
          const searchName = (action.name ?? '').toLowerCase();

          // Fuzzy match: exact first, then includes, then partial
          let matched = userHabits.find((h) => h.name.toLowerCase() === searchName);
          if (!matched) {
            matched = userHabits.find((h) => h.name.toLowerCase().includes(searchName) || searchName.includes(h.name.toLowerCase()));
          }
          if (!matched) {
            // Try word-level matching
            const words = searchName.split(/\s+/);
            matched = userHabits.find((h) =>
              words.some((w) => w.length > 2 && h.name.toLowerCase().includes(w))
            );
          }

          if (matched) {
            const result = await habitService.completeHabit(
              matched.id,
              userId,
              undefined,
              action.hoursLogged
            );
            const todayComp = result.completions?.find((c) => c.completed);
            const xpGained = todayComp?.xpAwarded ?? matched.xpReward;
            results.push({ type: 'complete_habit', success: true, detail: `Completed "${matched.name}" (+${xpGained} XP)` });
          } else {
            results.push({ type: 'complete_habit', success: false, detail: `Could not find habit matching "${action.name}"` });
          }
          break;
        }

        case 'create_goal': {
          let categoryId2: string | null = null;
          if (action.categoryName) {
            const freshDb3 = readDb();
            const cat = freshDb3.categories.find(
              (c) => c.userId === userId && c.name.toLowerCase() === action.categoryName!.toLowerCase()
            );
            if (cat) categoryId2 = cat.id;
          }

          const goalType = (['SHORT_TERM', 'LONG_TERM'].includes(action.goalType ?? '')
            ? action.goalType
            : 'SHORT_TERM') as GoalType;

          const goal = await goalService.createGoal(userId, {
            title: action.name ?? 'New Goal',
            description: action.description ?? null,
            type: goalType,
            targetValue: action.targetValue ?? 100,
            xpReward: action.xpReward ?? 50,
            categoryId: categoryId2,
            deadline: action.deadline ?? null,
          });
          results.push({ type: 'create_goal', success: true, detail: `Created goal "${goal.title}" (${goal.xpReward} XP reward)` });
          break;
        }

        case 'log_xp': {
          let categoryId3: string | undefined;
          if (action.categoryName) {
            const freshDb4 = readDb();
            const cat = freshDb4.categories.find(
              (c) => c.userId === userId && c.name.toLowerCase() === action.categoryName!.toLowerCase()
            );
            if (cat) categoryId3 = cat.id;
          }

          await xpService.logXP(userId, {
            amount: action.amount ?? 10,
            type: 'MANUAL',
            categoryId: categoryId3,
            source: action.source ?? 'AI logged',
          });
          results.push({ type: 'log_xp', success: true, detail: `Logged +${action.amount ?? 10} XP${action.source ? ` (${action.source})` : ''}` });
          break;
        }

        default:
          results.push({ type: action.type, success: false, detail: `Unknown action type: ${action.type}` });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      results.push({ type: action.type, success: false, detail: e.message ?? 'Unknown error' });
    }
  }

  return results;
}

// ===== Main Chat Function =====
export async function chat(
  userId: string,
  message: string,
  history?: { role: string; content: string }[]
): Promise<{
  response: string;
  actions_taken: ActionResult[];
  needs_clarification: boolean;
  clarification_question: string | null;
  model_used: string;
}> {
  // Guardrails
  if (!env.GROQ_API_KEY) {
    throw new AppError(500, 'GROQ_API_KEY is not configured');
  }
  checkRateLimit(userId);

  if (!message || typeof message !== 'string') {
    throw new AppError(400, 'Message is required');
  }

  const sanitizedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!sanitizedMessage) {
    throw new AppError(400, 'Message cannot be empty');
  }

  // Build messages array
  const systemPrompt = buildSystemPrompt(userId);
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history (max last 10 messages)
  if (history && Array.isArray(history)) {
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({ role: 'user', content: sanitizedMessage });

  // Call Groq
  const { content, model } = await callGroq(messages);
  const aiResponse = parseAIResponse(content);

  // Execute actions if no clarification needed
  let actionResults: ActionResult[] = [];
  if (!aiResponse.needs_clarification && aiResponse.actions.length > 0) {
    actionResults = await executeActions(userId, aiResponse.actions);
  }

  return {
    response: aiResponse.response,
    actions_taken: actionResults,
    needs_clarification: aiResponse.needs_clarification,
    clarification_question: aiResponse.clarification_question,
    model_used: model,
  };
}
