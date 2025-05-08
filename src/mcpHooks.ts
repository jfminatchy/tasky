import { Task, TaskList } from './taskSchema';
import { readTasksFile, writeTasksFile } from './tasky-utils/taskFile';
import { v4 as uuidv4 } from 'uuid';

export function listTasks(filters: { s?: string, state?: Task['state'], parentId?: string, id?: string }, rootPath: string): TaskList {
  let tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  if (filters.id) {
    tasks = tasks
      .filter((task): task is Task => task.id === filters.id)
      .concat(
        tasks
          .flatMap((task) => task.subtasks)
          .filter((subtask): subtask is Task => subtask.id === filters.id)
          .map((subtask) => ({
            ...tasks.find((task: Task) => task.subtasks.some((st: Task) => st.id === subtask.id)),
            subtasks: [subtask],
          }))
          .flatMap((task) => listTasks({ id: filters.id }, rootPath))
      );

  }
  if (filters.state) {
    tasks = tasks.flatMap((task) => task.subtasks).filter((task): task is Task => task.state === filters.state);
  }
  if (filters.parentId) {
    tasks = tasks.filter((task): task is Task => task.id === filters.parentId);
  }
  if (filters.s) {
    const search = filters.s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    tasks = tasks.flatMap((task) => {
      const hasFilter = task.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes(search)
        || task.description
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes(search)
        || task.completionDetails
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes(search);
      if (hasFilter) {
        return [task];
      }
      return task.subtasks.flatMap((subtask: Task) => listTasks({ s: filters.s }, rootPath));
    });
  }

  return tasks;
}

/**
 * Ajoute une tâche ou sous-tâche à la liste
 */
// Correction signature : newTask peut être potentiellement undefined
export function addTask(newTask: Omit<Task, 'id' | 'subtasks'> & { subtasks?: Task[] } = {}, rootPath: string, parentId?: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  // Correction : garantir que newTask est bien défini et que subtasks est toujours un tableau
  const safeNewTask = newTask && typeof newTask === 'object' ? newTask : {};
  const taskWithId: Task = {
    ...safeNewTask,
    id: uuidv4(),
    subtasks: Array.isArray(safeNewTask.subtasks) ? safeNewTask.subtasks.map((t) => ({ ...t, id: uuidv4() })) : [],
  };
  if (!parentId) {
    const updated = [...tasks, taskWithId];
    writeTasksFile(updated, rootPath);
    return updated;
  } else {
    const updated = tasks
      .filter((task): task is Task => !!task && typeof task === 'object' && 'id' in task)
      .map((task: Task) =>
        task.id === parentId
          ? { ...task, subtasks: [...(Array.isArray(task.subtasks) ? task.subtasks : []), taskWithId] }
          : task
      );
    writeTasksFile(updated, rootPath);
    return updated;
  }
}

/**
 * Modifie une tâche ou sous-tâche (par id)
 */
export function updateTask(updatedTask: Task, rootPath: string, parentId?: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  function updateInList(list: Task[]): Task[] {
    return list.map((task: Task) => {
      if (task.id === updatedTask.id) {
        return { ...updatedTask };
      } else if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: updateInList(task.subtasks) };
      } else {
        return task;
      }
    });
  }
  const updated = updateInList(tasks);
  writeTasksFile(updated, rootPath);
  return updated;
}

/**
 * Supprime une tâche ou sous-tâche (par id)
 */
export function deleteTask(taskId: string, rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  function removeInList(list: Task[]): Task[] {
    return list
      .filter((task: Task) => task.id !== taskId)
      .map((task: Task) => ({
        ...task,
        subtasks: task.subtasks ? removeInList(task.subtasks) : [],
      }));
  }
  const updated = removeInList(tasks);
  writeTasksFile(updated, rootPath);
  return updated;
}

/**
 * Change l'état d'une tâche ou sous-tâche (par id)
 */
export function changeTaskState(taskId: string, newState: Task['state'], rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  function changeStateInList(list: Task[]): Task[] {
    return list.map((task: Task) => {
      if (task.id === taskId) {
        return { ...task, state: newState };
      } else if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: changeStateInList(task.subtasks) };
      } else {
        return task;
      }
    });
  }
  const updated = changeStateInList(tasks);
  writeTasksFile(updated, rootPath);
  return updated;
}

/**
 * Ajoute une explication de complétion à une tâche ou sous-tâche (par id)
 */
export function addCompletionDetails(taskId: string, details: string, rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  function addDetailsInList(list: Task[]): Task[] {
    return list.map((task: Task) => {
      if (task.id === taskId) {
        return { ...task, completionDetails: details };
      } else if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: addDetailsInList(task.subtasks) };
      } else {
        return task;
      }
    });
  }
  const updated = addDetailsInList(tasks);
  writeTasksFile(updated, rootPath);
  return updated;
}
