import crypto from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';
import path from 'node:path';

const database = new Database();

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body ?? {};

            if(!title || !description) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: 'Title and description are required.'})
                );
            }

            const now = new Date().toISOString();

            const task = {
                id: crypto.randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: now,
                updated_at: now,
            };

            database.insert('tasks', task);

            return res.writeHead(201).end(JSON.stringify(task));
        },
    },

    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
            }: null);

            return res.end(JSON.stringify(tasks));
        },
    },

    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body ?? {};

            if (!title && !description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: "You need to inform title and description to update."})
                )
            }

            const dataToUpdate = { updated_at: new Date().toISOString() };
            if (title) dataToUpdate.title = title;
            if (description) dataToUpdate.description = description;

            const taskExistsAndWasUpdated = database.update('tasks', id, dataToUpdate);

            if (!taskExistsAndWasUpdated) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: "Task not found."})
                )
            }

            return res.writeHead(204).end();
        } 
    },

    {
        method: "DELETE",
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const taskExistsAndWasDeleted = database.delete('tasks', id);

            if (!taskExistsAndWasDeleted) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: "Task not found."})
                )
            }

            return res.writeHead(204).end();
        }
    },

    {
        method: "PATCH",
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;

            const [task] = database.select('tasks').filter(row => row.id === id);

            if (!task) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: "Task not found."})
                )
            }

            const isTaskCompleted = !!task.completed_at;
            const completed_at = isTaskCompleted ? null : new Date().toISOString();

            database.update('tasks', id, { completed_at });

            return res.writeHead(204).end();
        }
    }
];

