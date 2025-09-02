import fs from 'fs';
import path from 'path';
import { fail } from '@sveltejs/kit';

const dataPath = path.resolve(process.cwd(), 'src/lib/data/todolist.json');

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

function readTodos(): Todo[] {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeTodos(todos: Todo[]) {
  fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
}

export async function load() {
  const todos = readTodos();
  return { todos };
}

export const actions = {
  add: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text');

    if (!text) {
      return fail(400, { text, missing: true });
    }

    const todos = readTodos();
    const newTodo: Todo = {
      id: Date.now(),
      text: text.toString(),
      completed: false,
    };
    todos.push(newTodo);
    writeTodos(todos);

    return { success: true };
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id) {
      return fail(400, { id, missing: true });
    }

    let todos = readTodos();
    todos = todos.filter((todo: Todo) => todo.id !== Number(id));
    writeTodos(todos);

    return { success: true };
  },
};
