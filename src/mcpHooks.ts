import { Task, TaskList } from './taskSchema';
import { readTasksFile, writeTasksFile } from './tasky-utils/taskFile';
import { v4 as uuidv4 } from 'uuid';

function getTaskWithSubtasks(task: Task, rootPath: string): Task {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  const subtasks = tasks.filter((t): t is Task => t.parentId === task.id);
  return {
    ...task,
    subtasks: subtasks.map((st) => getTaskWithSubtasks(st, rootPath)),
  };
}

export function listTasks(filters: { s?: string, state?: Task['state'], parentId?: string, id?: string }, rootPath: string): TaskList {
  let tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  if (filters.id) {
    tasks = tasks.filter((task): task is Task => task.id === filters.id);
  }
  if (filters.state) {
    tasks = tasks.filter((task): task is Task => task.state === filters.state);
  }
  if (filters.parentId) {
    tasks = tasks.filter((task): task is Task => task.id === filters.parentId);
  }
  if (filters.s) {
    const search = filters.s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    tasks = tasks.filter((task): task is Task => {
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
      return hasFilter;
    });
  }

  return tasks.filter((t): t is Task => !t.parentId).map((task) => getTaskWithSubtasks(task, rootPath));
}

/**
 * Ajoute une tâche ou sous-tâche à la liste
 */
// Correction signature : newTask peut être potentiellement undefined
export function addTask(newTask: Omit<Task, 'id' | 'subtasks'> & { subtasks?: Task[] } = {}, rootPath: string, parentId?: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  // Correction : garantir que newTask est bien défini et que subtasks est toujours un tableau
  const safeNewTask = newTask && typeof newTask === 'object' ? newTask : {};
  const newTaskId = uuidv4();
  // if (parentId) {
  //   console.log("Adding subtask to task " + parentId);
  // }
  // console.log("Adding task " + newTask.name + " with id " + newTaskId);
  const taskWithId: Task = {
    name: safeNewTask.name,
    state: safeNewTask.state,
    id: newTaskId
  };
  if (parentId) {
    taskWithId.parentId = parentId;
  }
  if (safeNewTask.description) {
    taskWithId.description = safeNewTask.description;
  }
  if (safeNewTask.completionDetails) {
    taskWithId.completionDetails = safeNewTask.completionDetails;
  }

  const updated = [...tasks, taskWithId];
  writeTasksFile(updated, rootPath);

  safeNewTask?.subtasks?.forEach((subtask) => {
    addTask(subtask, rootPath, newTaskId);
  });

  return updated;
}

/**
 * Modifie une tâche ou sous-tâche (par id)
 */
export function updateTask(updatedTask: Task, rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  function updateInList(list: Task[]): Task[] {
    return list.map((task: Task) => {
      if (task.id === updatedTask.id) {
        return { ...task, ...updatedTask };
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
  const updated = tasks.filter((task: Task) => task.id !== taskId);
  writeTasksFile(updated, rootPath);
  return updated;
}

/**
 * Change l'état d'une tâche ou sous-tâche (par id)
 */
export function changeTaskState(taskId: string, newState: Task['state'], rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  const updated = tasks.map((task: Task) => {
    if (task.id === taskId) {
      return { ...task, state: newState };
    } else {
      return task;
    }
  });
  writeTasksFile(updated, rootPath);
  return updated;
}

/**
 * Ajoute une explication de complétion à une tâche ou sous-tâche (par id)
 */
export function addCompletionDetails(taskId: string, details: string, rootPath: string): TaskList {
  const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
  const updated = tasks.map((task: Task) => {
    if (task.id === taskId) {
      return { ...task, completionDetails: details };
    } else {
      return task;
    }
  });
  writeTasksFile(updated, rootPath);
  return updated;
}
