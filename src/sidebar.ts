import * as vscode from 'vscode';
import { readTasksFile } from './tasky-utils/taskFile';
import { Task } from './taskSchema';

/**
 * TreeItem pour représenter une tâche ou sous-tâche
 */
export class TaskTreeItem extends vscode.TreeItem {
  constructor(
    public readonly task: Task,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(task.name, collapsibleState);
    this.description = task.state;
    this.tooltip = task.description || '';
    this.contextValue = 'task';
    this.iconPath = new vscode.ThemeIcon(
      task.state === 'terminée' ? 'check' : task.state === 'en cours' ? 'sync~spin' : 'circle-outline'
    );
  }
}

/**
 * Provider pour l'arborescence des tâches
 */
export class TaskTreeDataProvider implements vscode.TreeDataProvider<TaskTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TaskTreeItem | undefined | void> = new vscode.EventEmitter<TaskTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<TaskTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskTreeItem): Thenable<TaskTreeItem[]> {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!rootPath) {
      return Promise.resolve([]);
    }
    const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
    if (!element) {
      return Promise.resolve(tasks.map((task: Task) => new TaskTreeItem(task, vscode.TreeItemCollapsibleState.Collapsed)));
    } else {
      return Promise.resolve(
        (element.task.subtasks || []).map((subtask: Task) => new TaskTreeItem(subtask, vscode.TreeItemCollapsibleState.Collapsed))
      );
    }
  }
}
