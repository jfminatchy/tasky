import { z } from "zod";

// Définition du schéma principal d'une tâche
export const TaskSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Le nom est obligatoire"),
    description: z.string().optional(),
    state: z.enum(["à faire", "en cours", "terminée"]),
    subtasks: z.array(TaskSchema).optional(),
    completionDetails: z.string().optional(),
    parentId: z.string().optional(),
  })
);

// Schéma pour la liste des tâches (fichier tasky-tasks.json)
export const TaskListSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
