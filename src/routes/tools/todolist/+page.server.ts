import { turso } from '$lib/server/turso';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export async function load(): Promise<{ todos: Todo[] }> {
  try {
    const result = await turso.execute('SELECT id, text, completed FROM todos');
    const todos: Todo[] = result.rows.map((row) => ({
      id: row.id as string,
      text: row.text as string,
      completed: !!row.completed, // Convert 1/0 to true/false
    }));
    return { todos };
  } catch (error) {
    console.error('Failed to load todos:', error);
    return { todos: [] };
  }
}

export const actions = {
  add: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text');

    if (!text) {
      return fail(400, { text, missing: true });
    }

    const newTodo = {
      id: crypto.randomUUID(),
      text: text.toString(),
    };

    try {
      await turso.execute({
        sql: 'INSERT INTO todos (id, text) VALUES (?, ?)',
        args: [newTodo.id, newTodo.text],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to add todo:', error);
      return fail(500, { text: newTodo.text, error: 'Failed to add todo' });
    }
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id) {
      return fail(400, { id, missing: true });
    }

    try {
      await turso.execute({ sql: 'DELETE FROM todos WHERE id = ?', args: [id.toString()] });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete todo:', error);
      return fail(500, { id, error: 'Failed to delete todo' });
    }
  },

  toggle: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    const completed = data.get('completed') === 'true';

    if (!id) {
      return fail(400, { id, missing: true });
    }

    try {
      await turso.execute({
        sql: 'UPDATE todos SET completed = ? WHERE id = ?',
        args: [!completed ? 1 : 0, id.toString()],
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      return fail(500, { id, error: 'Failed to toggle todo' });
    }
  },
};