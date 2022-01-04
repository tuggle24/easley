import waitFor from "./wait-for.js";

export function createTaskStore() {
  const tasks = new Set();

  const emptyStore = async () => {
    return await waitFor(async () => tasks.size === 0);
  };

  const removeTask = (task) => tasks.delete(task);

  const insertTask = (action, time = 0) => {
    const task = setTimeout(() => {
      action();
      removeTask(task);
    }, time);

    tasks.add(task);
  };

  return {
    emptyStore,
    removeTask,
    insertTask,
  };
}
