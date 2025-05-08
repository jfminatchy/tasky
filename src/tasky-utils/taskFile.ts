import * as fs from 'fs';
import * as path from 'path';
import { TaskListSchema, TaskList } from '../taskSchema';

// Renvoie le chemin du dossier .vscode du workspace principal
export function getTasksDir(rootPath: string) {
  return path.join(rootPath, '.vscode');
}

export function getTasksFile(rootPath: string) {
  return path.join(getTasksDir(rootPath), 'tasky-tasks.json');
}

/**
 * Crée le fichier de tâches vide s'il n'existe pas, dans le bon workspace
 */
export function createTasksFileIfNotExists(rootPath: string) {
  const tasksDir = getTasksDir(rootPath);
  const tasksFile = getTasksFile(rootPath);
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir);
  }
  if (!fs.existsSync(tasksFile)) {
    fs.writeFileSync(tasksFile, '[]', { encoding: 'utf-8' });
  }
}

/**
 * Lit et valide la liste des tâches
 */
export function readTasksFile(rootPath: string): TaskList {
  const tasksFile = getTasksFile(rootPath);
  if (!fs.existsSync(tasksFile)) {
    return [];
  }
  const data = fs.readFileSync(tasksFile, 'utf-8');
  const parsed = JSON.parse(data);
  return TaskListSchema.parse(parsed);
}

/**
 * Écrit la liste des tâches (après validation)
 */
export function writeTasksFile(tasks: TaskList, rootPath: string) {
  const validated = TaskListSchema.parse(tasks);
  const tasksFile = getTasksFile(rootPath);
  fs.writeFileSync(tasksFile, JSON.stringify(validated, null, 2), {
    encoding: 'utf-8',
  });
}

/**
 * Supprime le fichier de tâches
 */
export function deleteTasksFile(rootPath: string) {
  const tasksFile = getTasksFile(rootPath);
  if (fs.existsSync(tasksFile)) {
    fs.unlinkSync(tasksFile);
  }
}
