import * as vscode from 'vscode';
import { createTasksFileIfNotExists, readTasksFile, writeTasksFile, deleteTasksFile } from './tasky-utils/taskFile';
import { addTask, updateTask, deleteTask as mcpDeleteTask, changeTaskState, addCompletionDetails } from './mcpHooks';
import { TaskTreeDataProvider } from './sidebar';
import { Task } from './taskSchema';
import { TaskTreeItem } from './sidebar';

import { startMcpServer } from './mcpServer';

export function activate(context: vscode.ExtensionContext) {
    const extensionPath = context.extensionUri.fsPath;
    const taskTreeDataProvider = new TaskTreeDataProvider();
    vscode.window.registerTreeDataProvider('tasky-tasks', taskTreeDataProvider);

    // Lancement du serveur MCP SSE (une seule fois)
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (rootPath) {
        startMcpServer(rootPath);
    } else {
        vscode.window.showWarningMessage('Tasky MCP Server non démarré : aucun workspace ouvert.');
    }

    // --- Ajout du FileSystemWatcher pour le rafraîchissement automatique et gestion du contexte On/Off ---
    const fs = require('fs');
    function updateTaskyContext() {
        if (!rootPath) return;
        const filePath = rootPath + '/.vscode/tasky-tasks.json';
        const exists = fs.existsSync(filePath);
        vscode.commands.executeCommand('setContext', 'taskyTasksFileExists', exists);
        vscode.commands.executeCommand('setContext', 'taskyTasksFileMissing', !exists);
    }
    if (rootPath) {
        const tasksFilePath = vscode.Uri.file(rootPath + '/.vscode/tasky-tasks.json');
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(tasksFilePath.fsPath, '*'));
        watcher.onDidChange(() => {
            taskTreeDataProvider.refresh();
            updateTaskyContext();
        });
        watcher.onDidCreate(() => {
            taskTreeDataProvider.refresh();
            updateTaskyContext();
        });
        watcher.onDidDelete(() => {
            taskTreeDataProvider.refresh();
            updateTaskyContext();
        });
        context.subscriptions.push(watcher);
        updateTaskyContext(); // initial
    }


    let helloDisposable = vscode.commands.registerCommand('tasky.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Tasky!');
    });


    let startMcpServerDisposable = vscode.commands.registerCommand('tasky.startMcpServer', () => {
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        startMcpServer(rootPath);
    });


    let createTasksFileDisposable = vscode.commands.registerCommand('tasky.createTasksFile', () => {
        try {
            const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!rootPath) {
                vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
                return;
            }
            createTasksFileIfNotExists(rootPath);
            vscode.window.showInformationMessage('Le fichier .vscode/tasky-tasks.json a été créé ou existe déjà.');
        } catch (error) {
            vscode.window.showErrorMessage('Erreur lors de la création du fichier de tâches : ' + (error instanceof Error ? error.message : String(error)));
        }
    });

    let readTasksFileDisposable = vscode.commands.registerCommand('tasky.readTasksFile', () => {
        try {
            const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!rootPath) {
                vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
                return;
            }
            const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
            vscode.window.showInformationMessage('Tâches lues : ' + JSON.stringify(tasks, null, 2));
        } catch (error) {
            vscode.window.showErrorMessage('Erreur lors de la lecture du fichier de tâches : ' + (error instanceof Error ? error.message : String(error)));
        }
    });

    let writeTasksFileDisposable = vscode.commands.registerCommand('tasky.writeTasksFile', () => {
        try {
            const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!rootPath) {
                vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
                return;
            }
            // Exemple d'écriture d'une tâche fictive
            const exampleTasks = [
                {
                    id: '00000000-0000-0000-0000-000000000001',
                    name: 'Exemple de tâche',
                    description: 'Ceci est une tâche exemple',
                    state: 'à faire',
                    subtasks: [],
                    completionDetails: ''
                }
            ];
            writeTasksFile(exampleTasks, rootPath);
            vscode.window.showInformationMessage('Exemple de tâche écrite dans .vscode/tasky-tasks.json');
        } catch (error) {
            vscode.window.showErrorMessage('Erreur lors de l\'écriture du fichier de tâches : ' + (error instanceof Error ? error.message : String(error)));
        }
    });

    let deleteTasksFileDisposable = vscode.commands.registerCommand('tasky.deleteTasksFile', () => {
        try {
            const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!rootPath) {
                vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
                return;
            }
            deleteTasksFile(rootPath);
            vscode.window.showInformationMessage('Fichier de tâches supprimé.');
        } catch (error) {
            vscode.window.showErrorMessage('Erreur lors de la suppression du fichier de tâches : ' + (error instanceof Error ? error.message : String(error)));
        }
    });

    // Commande MCP : Ajouter une tâche ou sous-tâche
    let addTaskDisposable = vscode.commands.registerCommand('tasky.addTask', async (parentTask?: TaskTreeItem) => {
    try {
        let parentId;
        if (parentTask) {
            parentId = parentTask.task.id;
        }
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        // Formulaire interactif pour saisir les champs obligatoires
        const name = await vscode.window.showInputBox({
            prompt: 'Nom de la tâche',
            placeHolder: 'Entrez le nom de la tâche',
            validateInput: value => value.trim() === '' ? 'Le nom est obligatoire' : undefined
        });
        if (!name) return;
        const description = await vscode.window.showInputBox({
            prompt: 'Description (optionnelle)',
            placeHolder: 'Entrez une description (optionnelle)'
        });
        const statePick = await vscode.window.showQuickPick([
            { label: 'à faire' },
            { label: 'en cours' },
            { label: 'terminée' }
        ], {
            placeHolder: 'État de la tâche',
            canPickMany: false,
            ignoreFocusOut: true
        });
        const state = statePick?.label || 'à faire';
        // Création de la tâche
        const result = addTask({ name, description, state }, rootPath, parentId);
        vscode.window.showInformationMessage('Tâche ajoutée avec succès.');
        return result;
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de l\'ajout de la tâche : ' + (error instanceof Error ? error.message : String(error)));
    }
});

let addFirstLevelTask = vscode.commands.registerCommand('tasky.addFirstLevelTask', async () => {
    vscode.commands.executeCommand('tasky.addTask');
});


    // Commande MCP : Modifier une tâche ou sous-tâche
    let updateTaskDisposable = vscode.commands.registerCommand('tasky.updateTask', async (taskTreeItem: TaskTreeItem, parentId) => {
    try {        
        const task = taskTreeItem.task;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        // Charger toutes les tâches
        const tasks = (readTasksFile(rootPath) as (Task | null)[]).filter((t): t is Task => !!t && typeof t === 'object');
        // Trouver la tâche à modifier
        const targetId = typeof task === 'string' ? task : task?.id;
        let foundTask: Task | undefined = tasks.find(t => t.id === targetId);
        if (!foundTask) {
            vscode.window.showErrorMessage('Tâche à modifier introuvable.');
            return;
        }
        // Demander les nouvelles valeurs
        const newName = await vscode.window.showInputBox({
            prompt: 'Modifier le nom de la tâche',
            value: foundTask.name
        });
        if (!newName) return;
        const newDescription = await vscode.window.showInputBox({
            prompt: 'Modifier la description',
            value: foundTask.description || ''
        });
        const states = [
            { label: 'à faire' },
            { label: 'en cours' },
            { label: 'terminée' }
        ];
        const picked = await vscode.window.showQuickPick(states, {
            placeHolder: 'Modifier l\'état',
            canPickMany: false,
            ignoreFocusOut: true,
            title: 'État de la tâche'
        });
        const newState = picked?.label;
        if (!newState) return;
        // Mettre à jour la tâche
        updateTask({ id: targetId, name: newName, description: newDescription, state: newState }, rootPath);
        vscode.window.showInformationMessage('Tâche modifiée avec succès.');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de la modification de la tâche : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    // Commande MCP : Supprimer une tâche ou sous-tâche
    let deleteTaskDisposable = vscode.commands.registerCommand('tasky.deleteTask', async (taskTreeItem: TaskTreeItem) => {
    try {
        const taskId = taskTreeItem.task.id;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        const result = mcpDeleteTask(taskId, rootPath);
        vscode.window.showInformationMessage('Tâche supprimée.');
        return result;
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de la suppression de la tâche : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    // Commande MCP : Changer l'état d'une tâche ou sous-tâche
    let changeTaskStateDisposable = vscode.commands.registerCommand('tasky.changeTaskState', async (taskTreeItem: TaskTreeItem) => {
    try {
        const taskId = taskTreeItem.task.id;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        const states = ['à faire', 'en cours', 'terminée'];
        const currentState = taskTreeItem.task.state;
        const quickPickItems = states.map(state => ({ label: state, picked: state === currentState }));
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Choisissez le nouvel état de la tâche',
            canPickMany: false
        });
        if (!selected) {
            return; // Annulé par l'utilisateur
        }
        const result = changeTaskState(taskId, selected.label, rootPath);
        vscode.window.showInformationMessage('État de la tâche modifié.');
        return result;
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors du changement d\'état de la tâche : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    // Commande MCP : Ajouter une explication de complétion
    let addCompletionDetailsDisposable = vscode.commands.registerCommand('tasky.addCompletionDetails', async (taskTreeItem: TaskTreeItem, details) => {
    try {
        const taskId = taskTreeItem.task.id;
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        // Si details n'est pas fourni, demander à l'utilisateur
        let finalDetails = details;
        if (!finalDetails) {
            finalDetails = await vscode.window.showInputBox({
                prompt: 'Ajouter une explication de complétion',
                placeHolder: 'Décrivez comment la tâche a été complétée',
                validateInput: value => value.trim() === '' ? 'L\'explication est obligatoire' : undefined
            });
            if (!finalDetails) return;
        }
        const result = addCompletionDetails(taskId, finalDetails, rootPath);
        vscode.window.showInformationMessage('Explication de complétion ajoutée à la tâche.');
        return result;
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de l\'ajout de l\'explication de complétion : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    let activateTaskyDisposable = vscode.commands.registerCommand('tasky.activateTasky', async () => {
    try {
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        const fs = require('fs');
        const tasksFile = rootPath + '/.vscode/tasky-tasks.json';
        if (fs.existsSync(tasksFile)) {
            vscode.window.showInformationMessage('La gestion des tâches est déjà activée ("Off").');
            return;
        }
        createTasksFileIfNotExists(rootPath);
        vscode.window.showInformationMessage('Gestion des tâches activée ("On").');
        taskTreeDataProvider.refresh();
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de l\'activation de Tasky : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    let deactivateTaskyDisposable = vscode.commands.registerCommand('tasky.deactivateTasky', async () => {
    try {
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Aucun dossier de workspace ouvert.');
            return;
        }
        const fs = require('fs');
        const tasksFile = rootPath + '/.vscode/tasky-tasks.json';
        if (!fs.existsSync(tasksFile)) {
            vscode.window.showInformationMessage('La gestion des tâches est déjà désactivée ("On").');
            return;
        }
        deleteTasksFile(rootPath);
        vscode.window.showInformationMessage('Gestion des tâches désactivée ("Off").');
        taskTreeDataProvider.refresh();
    } catch (error) {
        vscode.window.showErrorMessage('Erreur lors de la désactivation de Tasky : ' + (error instanceof Error ? error.message : String(error)));
    }
});

    // Commande "Plus d'actions" : affiche un menu QuickPick
    let moreActionsDisposable = vscode.commands.registerCommand('tasky.moreActions', async (item) => {
        const actions = [
            { label: '✏️ Modifier', command: 'tasky.updateTask' },
            { label: '❌ Supprimer', command: 'tasky.deleteTask' },
            { label: '📝 Ajouter une explication', command: 'tasky.addCompletionDetails' }
        ];
        const selected = await vscode.window.showQuickPick(actions, {
            placeHolder: 'Choisissez une action',
        });
        if (selected) {
            // Passe l'item sélectionné à la commande cible si possible
            vscode.commands.executeCommand(selected.command, item);
        }
    });

    context.subscriptions.push(
        helloDisposable,
        startMcpServerDisposable,
        createTasksFileDisposable,
        readTasksFileDisposable,
        writeTasksFileDisposable,
        deleteTasksFileDisposable,
        addTaskDisposable,
        addFirstLevelTask,
        updateTaskDisposable,
        deleteTaskDisposable,
        changeTaskStateDisposable,
        addCompletionDetailsDisposable,
        activateTaskyDisposable,
        deactivateTaskyDisposable,
        moreActionsDisposable
    );
}

export function deactivate() {}