# Tasky - Your Vibe Coding Task Companion ✨

[![Version](https://img.shields.io/badge/version-0.3.2-blue)](https://github.com/jfminatchy/tasky/releases) 
<!-- [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Open Issues](https://img.shields.io/github/issues/your-github-username/tasky)](https://github.com/your-github-username/tasky/issues)
[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/your-github-username/tasky/pulls) -->

---

## English 🇺🇸

### Tired of taming tasks with markdown? Tasky is here!

Let's be real. We love the *idea* of `devbook.md` or similar markdown-based task tracking within our projects during those intense vibe coding sessions. It's simple, it's file-based... until it becomes a sprawling, unmanageable beast of a document.

Tasky is built from that very frustration! It's a **VS Code / Windsurf extension** designed to give you a structured, manageable, and *interactive* way to handle your development tasks and subtasks, right within your favorite Vibe Coding IDE. And guess what? It plays *exceptionally* well with AI agents! 🤖

### What is Tasky?

Tasky provides a dedicated side panel view to manage your project's development tasks. Instead of one giant markdown file, your task data lives in a clean, machine-readable `.vscode/tasky-tasks.json` file, allowing for easy parsing, manipulation, and integration – especially with AI.

### Features

🚀 **Streamlined task management:**
* **Dedicated side panel:** Access and manage all your tasks in a clean, tree-like view, similar to your file explorer.
* **Task hierarchy:** Organize your work with parent tasks and nested subtasks.
* **Interactive UI:** Add, edit, delete tasks/subtasks directly through intuitive buttons.
* **State tracking:** Visually track task progress.
* **Completion notes:** Document *how* a task was completed – great for future reference or explaining to your past/future self!
<!-- * **Detail View:** Click on any task item to see its full details in the main editor area. -->

⚙️ **Project integration:**
* **`.vscode/tasky-tasks.json`:** Your task data is stored in a standard JSON file within your project's `.vscode` directory. Easy to version control, easy for machines (and AI!) to read.
* **On/Off:** Simple buttons to start/stop Tasky management for your project, creating or removing the `.vscode/tasky-tasks.json` file and managing the MCP connection.

🤖 **AI-Ready (MCP integration):**
* Tasky is built with AI agents in mind. It connects to an MCP interface (by default at `http://localhost:6123/mcp`) that allows AI agents to interact directly with your task list.

### Why Tasky over `devbook.md`?

* **Structure:** No more parsing messy markdown! Tasky uses structured JSON (`.vscode/tasky-tasks.json`).
* **Interactivity:** Manage tasks with clicks, not text editing.
* **Scalability:** Handles large task lists without becoming overwhelming.
* **AI integration:** Built from the ground up for seamless AI automation via MCP.
* **Dedicated UI:** Tasks have their own place, not buried in code or documentation.

### Installation

Tasky is currently available as a VSIX file for direct installation.

1.  Go to the [Tasky GitHub Releases page](https://github.com/jfminatchy/tasky/releases).
2.  Download the latest `tasky-X.Y.Z.vsix` file.
3.  Open VS Code / Windsurf.
4.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
5.  Type "Install from VSIX" and select the command.
6.  Navigate to and select the downloaded `.vsix` file.
7.  Restart VS Code / Windsurf if prompted.

### How to use

1.  Open a project folder in VS Code / Windsurf.
2.  Open the Tasky side panel from the activity bar on the left.
3.  Click the "On" button. This creates the initial `.vscode/tasky-tasks.json` file.
4.  Use the buttons in the side panel view to add your main tasks.
5.  Hover over tasks to reveal action buttons (add subtask, edit, delete, add completion notes).
6.  Click the state emoji to cycle through states.
7.  Click a task name to see its details in the main editor.
8.  If you're using an AI agent, ensure it's running and configured to connect to the MCP server (default `http://localhost:6123/mcp`). Your AI agent can now interact with your tasks via the defined protocol!

### Configuration

By default, Tasky expects the MCP server to be running at `http://localhost:6123/mcp`. You will be able to change this URL in a future version.

How to configure the MCP server URL in the settings.json file:

```json
{
  "tasky": {
    "serverUrl": "http://localhost:6123/mcp"
  }
}
```

### Task structure

Each task and subtask is a JSON object with the following structure. The `.vscode/tasky-tasks.json` file is an array of these objects representing the top-level tasks.

```json
{
  "id": "string",          // A unique identifier (auto-generated, e.g., UUID)
  "name": "string",        // The name or title of the task
  "description": "string", // A detailed description of the task
  "state": "à faire" | "en cours" | "terminée", // Current status (using specified French states)
  "completion_notes": "string", // Notes on how the task was completed (optional)
  "subtasks": [            // Array of nested tasks (optional), each having the same structure
    // ... task objects ...
  ]
}
```

*Note: The `state` field in the JSON will use the specified French values: "à faire", "en cours", "terminée". The UI will display corresponding emojis. Internationalization will be added in a future version.*

### Future enhancements ✨

Tasky is actively being developed, and here are some features planned for future releases:

* 🌍 **Internationalization (i18n):** Add support for multiple languages to make Tasky accessible to a wider audience.
* ⚙️ **Configurable MCP server address:** I plan to refine and potentially expand configuration options related to the MCP connection.
* 🚦 **MCP server status & control:** Integrate UI elements into the sidebar to display the status of the connected MCP server and provide controls to start, stop, or restart the server directly from the extension.

### Acknowledgements

  * Inspired by the simplicity of the `devbook.md` concept, but seeking a more structured and interactive approach.
  * Built with the power and flexibility of the VS Code / Windsurf Extension API and the potential of Vibe Coding with AI agents.

-----

## Français 🇫🇷

-----

### Marre de gérer les tâches avec du Markdown ? Tasky est là \!

Soyons honnêtes. On adore l'idée de `devbook.md` ou d'autres méthodes de suivi de tâches basées sur Markdown au sein de nos projets pendant ces sessions intenses de vibe coding. C'est simple, basé sur des fichiers... jusqu'à ce que ça devienne une bête tentaculaire et ingérable de document.

Tasky est né de cette frustration même \! C'est une **extension VS Code / Windsurf** conçue pour vous offrir une manière structurée, gérable et *interactive* de gérer vos tâches et sous-tâches de développement, directement dans votre IDE de Vibe Coding préféré. Et devinez quoi ? Il s'entend bien avec les agents IA \! 🤖

### Qu'est-ce que Tasky ?

Tasky fournit un panneau latéral dédié pour gérer les tâches de développement de votre projet. Au lieu d'un seul fichier markdown géant, vos données de tâche résident dans un fichier `.vscode/tasky-tasks.json` propre et lisible par machine, permettant une analyse, une manipulation et une intégration faciles – surtout avec l'IA.

### Fonctionnalités

🚀 **Gestion simplifiée des tâches :**

  * **Panneau latéral dédié :** Accédez et gérez toutes vos tâches dans une vue propre et arborescente, similaire à votre explorateur de fichiers.
  * **Hiérarchie des tâches :** Organisez votre travail avec des tâches parentes et des sous-tâches imbriquées.
  * **Interface interactive :** Ajoutez, modifiez, supprimez des tâches/sous-tâches directement via des boutons intuitifs.
  * **Suivi d'état :** Suivez visuellement la progression des tâches.
  * **Notes de complétion :** Documentez *comment* une tâche a été complétée – excellent pour référence future ou pour expliquer à votre moi passé/futur \!
  <!-- * **Vue Détail :** Cliquez sur n'importe quel élément de tâche pour voir ses détails complets dans la zone de l'éditeur principal. -->

⚙️ **Intégration projet :**

  * **`.vscode/tasky-tasks.json` :** Vos données de tâche sont stockées dans un fichier JSON standard dans le répertoire `.vscode` de votre projet. Facile à versionner, facile à lire pour les machines (et l'IA \!).
  * **On/Off :** Boutons simples pour démarrer/arrêter la gestion des tâches par Tasky pour votre projet, créant ou supprimant le fichier `.vscode/tasky-tasks.json` et gérant la connexion MCP.

🤖 **Prêt pour l'IA (Intégration MCP) :**

  * Tasky est conçu en pensant aux agents IA. Il se connecte à une interface MCP (par défaut à `http://localhost:6123/mcp`) qui permet aux agents IA d'interagir directement avec votre liste de tâches.

### Pourquoi Tasky plutôt que `devbook.md` ?

  * **Structure :** Plus besoin d'analyser du markdown désordonné \! Tasky utilise du JSON structuré (`.vscode/tasky-tasks.json`).
  * **Interactivité :** Gérez les tâches avec des clics, pas de l'édition de texte.
  * **Évolutivité :** Gère les listes de tâches volumineuses sans devenir écrasant.
  * **Intégration IA :** Conçu dès le départ pour une automatisation IA transparente via MCP.
  * **UI dédiée :** Les tâches ont leur propre place, non enfouies dans le code ou la documentation.

### Installation

Tasky est actuellement disponible en tant que fichier VSIX pour une installation directe.

1.  Allez sur la [page des Releases GitHub de Tasky](https://github.com/jfminatchy/tasky/releases).
2.  Téléchargez le dernier fichier `tasky-X.Y.Z.vsix`.
3.  Ouvrez VS Code / Windsurf.
4.  Ouvrez la Palette de Commandes (`Ctrl+Shift+P` ou `Cmd+Shift+P`).
5.  Tapez "Install from VSIX" et sélectionnez la commande.
6.  Naviguez et sélectionnez le fichier `.vsix` téléchargé.
7.  Redémarrez VS Code / Windsurf si vous y êtes invité.

### Comment l'utiliser

1.  Ouvrez un dossier de projet dans VS Code / Windsurf.
2.  Ouvrez le panneau latéral Tasky depuis la barre d'activité à gauche.
3.  Cliquez sur le bouton "On". Cela crée le fichier `.vscode/tasky-tasks.json` initial.
4.  Utilisez les boutons dans la vue du panneau latéral pour ajouter vos tâches principales.
5.  Passez la souris sur les tâches pour révéler les boutons d'action (ajouter sous-tâche, modifier, supprimer, ajouter notes de complétion).
6.  Cliquez sur l'emoji d'état pour parcourir les états.
7.  Si vous utilisez un agent IA, assurez-vous qu'il est configuré pour se connecter au serveur MCP (par défaut `http://localhost:6123/mcp`). Votre agent IA peut maintenant interagir avec vos tâches via le protocole défini \!

### Configuration

Par défaut, le serveur MCP de Tasky est exécuté à l'adresse `http://localhost:6123/mcp`. Vous pourrez changer cette adresse dans une future version.

Voici la configuration d'ajout du serveur MCP :

```json
{
  "tasky": {
    "serverUrl": "http://localhost:6123/mcp"
  }
}
```

### Structure d'une tâche

Chaque tâche et sous-tâche est un objet JSON avec la structure suivante. Le fichier `.vscode/tasky-tasks.json` est un tableau de ces objets représentant les tâches de niveau supérieur.

```json
{
  "id": "string",          // Un identifiant unique (auto-généré, ex: UUID)
  "name": "string",        // Le nom ou titre de la tâche
  "description": "string", // Une description détaillée de la tâche
  "state": "à faire" | "en cours" | "terminée", // État actuel
  "completion_notes": "string", // Notes sur la manière dont la tâche a été complétée (optionnel)
  "subtasks": [            // Tableau de tâches imbriquées (optionnel), chacune ayant la même structure
    // ... objets tâche ...
  ]
}
```

*Note : Le champ `state` dans le JSON utilisera les valeurs françaises spécifiées : "à faire", "en cours", "terminée". L'interface utilisateur affichera les emojis correspondants. L'internationalisation sera ajoutée dans une future version.*

### Améliorations futures ✨

Tasky est en cours de développement actif, et voici quelques fonctionnalités prévues pour les prochaines versions :

* 🌍 **Internationalisation (i18n) :** Ajouter le support de plusieurs langues pour rendre Tasky accessible à un public plus large.
* ⚙️ **Adresse du serveur MCP configurable**
* 🚦 **État et contrôle du serveur MCP :** Intégrer des éléments d'interface utilisateur dans la barre latérale pour afficher l'état du serveur MCP connecté et fournir des contrôles pour démarrer, arrêter ou redémarrer le serveur directement depuis l'extension.


### Remerciements

  * Inspiré par la simplicité du concept `devbook.md`, mais cherchant une approche plus structurée et interactive.
  * Construit avec la puissance et la flexibilité de l'API d'extension VS Code / Windsurf et le potentiel du Vibe Coding avec les agents IA.
