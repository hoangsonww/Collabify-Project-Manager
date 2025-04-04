const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Collabify API",
    version: "1.0.0",
    description:
      "RESTful API for managing users, projects, tasks, and logs in Collabify. Disclaimer: This Swagger documentation is for documentation purposes only and might not work when used directly.",
  },
  tags: [
    { name: "Auth" },
    { name: "Admin" },
    { name: "Projects" },
    { name: "Tasks" },
    { name: "Users" },
    { name: "Logs" },
  ],
  paths: {
    "/api/admin/roles": {
      post: {
        tags: ["Admin"],
        summary: "Modify user roles (add or remove)",
        description:
          "Modifies a user's roles. Requires the authenticated user to be an admin. \n\n**Request Body:**\n- `action`: Must be either `add` or `remove`.\n- `userSub`: The user's unique identifier (e.g. `auth0|abc123`).\n- `roleName`: The name of the role to add or remove (e.g. `admin`).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  action: {
                    type: "string",
                    enum: ["add", "remove"],
                    description: "Action to perform: 'add' or 'remove'.",
                  },
                  userSub: {
                    type: "string",
                    description:
                      "User's unique identifier (e.g. 'auth0|abc123').",
                  },
                  roleName: {
                    type: "string",
                    description: "Role name to add or remove (e.g. 'admin').",
                  },
                },
                required: ["action", "userSub", "roleName"],
              },
              examples: {
                addRole: {
                  summary: "Add role",
                  value: {
                    action: "add",
                    userSub: "auth0|abc123",
                    roleName: "admin",
                  },
                },
                removeRole: {
                  summary: "Remove role",
                  value: {
                    action: "remove",
                    userSub: "auth0|abc123",
                    roleName: "admin",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Successfully modified the user role. Returns a success message.",
          },
          "400": {
            description:
              "Missing required fields or invalid action provided in the request body.",
          },
          "401": { description: "Not authenticated." },
          "403": { description: "Forbidden. The user is not an admin." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to modify user roles." },
        },
      },
    },
    "/api/auth/[...auth0]": {
      get: {
        tags: ["Auth"],
        summary: "Handle Auth0 authentication flows",
        description:
          "Handles login, logout, callback, etc., via Auth0. Redirects and session management are performed here.",
        responses: {
          "200": { description: "Auth0 action handled." },
          "500": { description: "Error during Auth0 process." },
        },
      },
    },
    "/api/logs": {
      get: {
        tags: ["Logs"],
        summary: "Retrieve system logs",
        description:
          "Retrieves the latest system logs from the local database. Requires authentication and admin privileges.",
        responses: {
          "200": {
            description: "Logs retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    logs: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated." },
          "403": { description: "Forbidden." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to retrieve logs." },
        },
      },
    },
    "/api/logs/auth0": {
      get: {
        tags: ["Logs"],
        summary: "Retrieve Auth0 logs",
        description:
          "Fetches logs from the Auth0 Management API. Requires proper Auth0 M2M credentials in the environment variables.",
        responses: {
          "200": {
            description: "Auth0 logs retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    logs: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          "500": { description: "Failed to fetch Auth0 logs." },
        },
      },
    },
    "/api/projects": {
      post: {
        tags: ["Projects"],
        summary: "Create a new project",
        description:
          "Creates a new project with a name and optional description. Requires authentication.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the project.",
                  },
                  description: {
                    type: "string",
                    description: "Optional project description.",
                  },
                },
                required: ["name"],
              },
              examples: {
                newProject: {
                  summary: "New project",
                  value: {
                    name: "Project Alpha",
                    description: "A sample project",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    projectId: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    members: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          "400": { description: "Name is required." },
          "401": { description: "Not authenticated." },
          "405": { description: "Method not allowed." },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a specific project by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": { description: "Project retrieved." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Update a project by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Updated name of the project.",
                  },
                  description: {
                    type: "string",
                    description: "Updated description.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Project updated." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "204": { description: "Project deleted successfully." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
        },
      },
    },
    "/api/projects/{id}/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List all tasks for a project",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": { description: "Tasks listed." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a new task for a project",
        description:
          "Creates a new task within a project. Requires the user to be a project member.\n\n**Request Body:**\n- `title`: Title of the task (required).\n- `assignedTo`: Optional user ID to assign the task.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Title of the task.",
                  },
                  assignedTo: {
                    type: "string",
                    description:
                      "User ID to whom the task is assigned (optional).",
                  },
                },
                required: ["title"],
              },
              examples: {
                newTask: {
                  summary: "New task",
                  value: {
                    title: "Design homepage",
                    assignedTo: "auth0|abc123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created successfully and project updated.",
          },
          "400": { description: "Invalid task title." },
          "401": { description: "Not authenticated." },
          "403": { description: "User is not a project member." },
          "405": { description: "Method not allowed." },
        },
      },
    },
    "/api/projects/{id}/tasks/{taskId}/toggle": {
      patch: {
        tags: ["Tasks"],
        summary: "Toggle task state (complete/incomplete)",
        description:
          "Toggles the status of a task within a project. Cycles through statuses: 'todo' → 'in-progress' → 'done' → 'todo'. Requires the user to be a project member.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          "200": { description: "Task status toggled and project updated." },
          "401": { description: "Not authenticated." },
          "403": { description: "User is not a project member." },
          "404": { description: "Project or task not found." },
          "405": { description: "Method not allowed." },
        },
      },
    },
    "/api/projects/{id}/tasks/join": {
      post: {
        tags: ["Projects"],
        summary: "Join a project",
        description:
          "Adds the authenticated user to the project's members if not already present.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": { description: "Successfully joined the project." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
          "405": { description: "Method not allowed." },
        },
      },
    },
    "/api/projects/{id}/tasks/leave": {
      post: {
        tags: ["Projects"],
        summary: "Leave a project",
        description:
          "Removes the authenticated user from the project's members.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          "200": { description: "Successfully left the project." },
          "401": { description: "Not authenticated." },
          "404": { description: "Project not found." },
          "405": { description: "Method not allowed." },
        },
      },
    },
    "/api/users/info": {
      get: {
        tags: ["Users"],
        summary: "Get current user info",
        description:
          "Fetches user info from Auth0 Management API. Expects a query parameter `user` representing the user's ID (e.g., `auth0|abc123`).",
        parameters: [
          {
            name: "user",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "User ID (e.g., 'auth0|abc123').",
          },
        ],
        responses: {
          "200": {
            description: "User info retrieved.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Missing user query parameter." },
          "500": { description: "Failed to fetch user info." },
        },
      },
    },
    "/api/users/roles": {
      get: {
        tags: ["Users"],
        summary: "Get roles of a user",
        description:
          "Retrieves the roles assigned to a user via Auth0 Management API. Expects a query parameter `sub` representing the user's unique identifier (e.g., `auth0|67ed7e518efad4e72a73d7c3`).",
        parameters: [
          {
            name: "sub",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "User sub (e.g., 'auth0|67ed7e518efad4e72a73d7c3').",
          },
        ],
        responses: {
          "200": {
            description: "User roles retrieved.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    roles: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Missing user sub." },
          "500": { description: "Failed to fetch roles." },
        },
      },
    },
  },
};

export default openApiSpec;
