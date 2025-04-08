const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Collabify API",
    version: "1.0.0",
    description:
      "RESTful API for managing users, projects, tasks, and logs in Collabify. Disclaimer: This Swagger documentation is for documentation purposes only and might not work when used directly due to Auth0 authentication and other backend logic only accessible via the frontend.",
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
    "/api/users/infoBatch": {
      get: {
        tags: ["Users"],
        summary: "Get info for multiple users",
        description:
          "Fetches information for multiple users based on a comma-separated list of user IDs provided via the `users` query parameter. The response is an object that maps each userSub to an object containing the user's name and email.",
        parameters: [
          {
            name: "users",
            in: "query",
            description:
              "Comma-separated list of user IDs (e.g., 'auth0|abc123,auth0|def456').",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "User info retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                    },
                    example: {
                      name: "John Doe",
                      email: "john@example.com",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing users query parameter.",
          },
          "500": {
            description: "Failed to fetch user info.",
          },
        },
      },
    },
    "/api/users/resendVerification": {
      post: {
        tags: ["Users"],
        summary: "Resend verification email",
        description:
          "Requests Auth0 to resend a verification email to the currently authenticated user. Requires the user to be authenticated.",
        responses: {
          "200": {
            description: "Verification email sent.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Verification email sent",
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to send verification email." },
        },
      },
    },
    "/api/users/updateProfile": {
      get: {
        tags: ["Users"],
        summary: "Retrieve user profile",
        description:
          "Retrieves the latest cached user profile from MongoDB for the authenticated user. If no cached profile exists, the endpoint fetches the full profile from Auth0, caches it, and then returns it.",
        responses: {
          "200": {
            description: "Profile retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Profile retrieved from Auth0",
                    },
                    user: {
                      type: "object",
                      properties: {
                        sub: {
                          type: "string",
                          example: "auth0|67de2a0b5c90af6ff1d16959",
                        },
                        sid: {
                          type: "string",
                          example: "OTX2jV2oCWsUudGyiN8VcJKZbbrXqbIS",
                        },
                        name: { type: "string", example: "snghoang@unc.edu" },
                        nickname: { type: "string", example: "snghoang" },
                        email: { type: "string", example: "snghoang@unc.edu" },
                        email_verified: { type: "boolean", example: false },
                        picture: {
                          type: "string",
                          example:
                            "https://s.gravatar.com/avatar/4caa51d7cb0e6bed9c18ae2f43cd2790?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fsn.png",
                        },
                        updated_at: {
                          type: "string",
                          format: "date-time",
                          example: "2025-04-08T20:57:00.109Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to retrieve profile." },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile",
        description:
          "Updates the user's profile in Auth0 (only the `name` and `nickname` fields). After updating, the full updated user profile is retrieved from Auth0 and cached in MongoDB.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "New name for the user.",
                  },
                  nickname: {
                    type: "string",
                    description: "New nickname for the user.",
                  },
                },
                required: ["name", "nickname"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Profile updated",
                    },
                    user: {
                      type: "object",
                      properties: {
                        sub: {
                          type: "string",
                          example: "auth0|67de2a0b5c90af6ff1d16959",
                        },
                        sid: {
                          type: "string",
                          example: "OTX2jV2oCWsUudGyiN8VcJKZbbrXqbIS",
                        },
                        name: { type: "string", example: "snghoang@unc.edu" },
                        nickname: { type: "string", example: "snghoang" },
                        email: { type: "string", example: "snghoang@unc.edu" },
                        email_verified: { type: "boolean", example: false },
                        picture: {
                          type: "string",
                          example:
                            "https://s.gravatar.com/avatar/4caa51d7cb0e6bed9c18ae2f43cd2790?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fsn.png",
                        },
                        updated_at: {
                          type: "string",
                          format: "date-time",
                          example: "2025-04-08T20:57:00.109Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid request body." },
          "401": { description: "Not authenticated." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to update profile." },
        },
      },
    },
    "/api/users/search": {
      get: {
        tags: ["Users"],
        summary: "Search users by name or nickname",
        description:
          "Searches for user profiles based on a query string (provided as `q`) that matches either the user's name or nickname using a case-insensitive regular expression.",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Query string to match the user's name or nickname.",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Users matching the search query.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          sub: {
                            type: "string",
                            example: "auth0|67ed7e518efad4e72a73d7c3",
                          },
                          name: { type: "string", example: "John Doe" },
                          nickname: { type: "string", example: "johnny" },
                          email: {
                            type: "string",
                            example: "johndoe@example.com",
                          },
                          picture: {
                            type: "string",
                            example: "https://example.com/avatar.jpg",
                          },
                          email_verified: { type: "boolean", example: false },
                          updated_at: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-08T20:57:00.109Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing or invalid query parameter 'q'.",
          },
          "500": {
            description: "Error searching for users.",
          },
        },
      },
    },
    "/api/projects/dashboard": {
      get: {
        tags: ["Projects"],
        summary: "Retrieve dashboard metrics and project statistics",
        description:
          "Retrieves various metrics and statistics for projects accessible by the authenticated user. For admin users, this endpoint returns metrics for all projects; for non-admin users, only projects where the user is in the membership array. The response includes overall task counts, the top 5 projects (based on task count), the largest and smallest project names (by number of tasks), per‑project statistics, and a detailed list of all projects.",
        responses: {
          "200": {
            description: "Dashboard metrics retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userSub: {
                      type: "string",
                      example: "auth0|abcdef123456",
                    },
                    isAdmin: {
                      type: "boolean",
                      example: true,
                    },
                    totalProjects: {
                      type: "integer",
                      example: 10,
                    },
                    totalTasks: {
                      type: "integer",
                      example: 150,
                    },
                    doneTasks: {
                      type: "integer",
                      example: 80,
                    },
                    todoTasks: {
                      type: "integer",
                      example: 30,
                    },
                    inProgressTasks: {
                      type: "integer",
                      example: 40,
                    },
                    topProjects: {
                      type: "array",
                      description: "Top 5 projects based on total tasks.",
                      items: {
                        type: "object",
                        properties: {
                          projectId: {
                            type: "string",
                            example: "project123",
                          },
                          name: {
                            type: "string",
                            example: "Project Alpha",
                          },
                          totalTasks: {
                            type: "integer",
                            example: 50,
                          },
                          doneTasks: {
                            type: "integer",
                            example: 30,
                          },
                          todoTasks: {
                            type: "integer",
                            example: 10,
                          },
                          inProgressTasks: {
                            type: "integer",
                            example: 10,
                          },
                        },
                      },
                    },
                    largestProjectName: {
                      type: "string",
                      example: "Project Alpha",
                    },
                    smallestProjectName: {
                      type: "string",
                      example: "Project Zeta",
                    },
                    projectStats: {
                      type: "array",
                      description: "Statistics for each project.",
                      items: {
                        type: "object",
                        properties: {
                          projectId: {
                            type: "string",
                            example: "project123",
                          },
                          name: {
                            type: "string",
                            example: "Project Alpha",
                          },
                          totalTasks: {
                            type: "integer",
                            example: 50,
                          },
                          doneTasks: {
                            type: "integer",
                            example: 30,
                          },
                          todoTasks: {
                            type: "integer",
                            example: 10,
                          },
                          inProgressTasks: {
                            type: "integer",
                            example: 10,
                          },
                        },
                      },
                    },
                    allProjects: {
                      type: "array",
                      description: "Detailed list of all projects.",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "60f1b3c6b4d1c4a1d8e9f123",
                          },
                          projectId: {
                            type: "string",
                            example: "project123",
                          },
                          name: {
                            type: "string",
                            example: "Project Alpha",
                          },
                          description: {
                            type: "string",
                            example: "A sample project",
                          },
                          membership: {
                            type: "array",
                            description: "List of members with roles.",
                            items: {
                              type: "object",
                              properties: {
                                userSub: {
                                  type: "string",
                                  example: "auth0|abc123",
                                },
                                role: {
                                  type: "string",
                                  example: "manager",
                                },
                              },
                            },
                          },
                          tasks: {
                            type: "array",
                            description: "List of tasks in the project.",
                            items: {
                              type: "object",
                              properties: {
                                _id: {
                                  type: "string",
                                  example: "60f1b3c6b4d1c4a1d8e9f124",
                                },
                                title: {
                                  type: "string",
                                  example: "Design homepage",
                                },
                                status: {
                                  type: "string",
                                  example: "todo",
                                },
                                assignedTo: {
                                  oneOf: [
                                    { type: "string", example: "auth0|abc123" },
                                    { type: "null" },
                                  ],
                                },
                                priority: {
                                  type: "string",
                                  example: "medium",
                                },
                                dueDate: {
                                  type: "string",
                                  format: "date-time",
                                  example: "2025-04-08T20:57:00.109Z",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated." },
          "500": { description: "Failed to retrieve dashboard metrics." },
        },
      },
    },
    "/api/projects/{id}/members": {
      get: {
        tags: ["Projects"],
        summary: "Get project members",
        description:
          "Retrieves the unique list of member IDs for a specific project. The project is identified by its projectId provided as a path parameter.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Project ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Project members retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    members: {
                      type: "array",
                      items: {
                        type: "string",
                        example: "auth0|abcdef12345",
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Project not found.",
          },
          "405": {
            description: "Method not allowed.",
          },
        },
      },
    },
    "/api/projects/members": {
      delete: {
        tags: ["Projects"],
        summary: "Remove a member from a project",
        description:
          "Removes the member specified by the `memberSub` query parameter from the project identified by the `id` query parameter. Only managers can remove members.",
        parameters: [
          {
            name: "id",
            in: "query",
            description: "Project ID",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "memberSub",
            in: "query",
            description:
              "The unique identifier of the member to remove (e.g., 'auth0|abc123')",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Member removed successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Member removed",
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated." },
          "403": { description: "Only managers can remove members." },
          "404": { description: "Project not found." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to remove member." },
        },
      },
    },
    "/api/projects/membership": {
      get: {
        tags: ["Projects"],
        summary: "Retrieve project membership",
        description:
          "Retrieves the membership array for the specified project. The project is identified via the 'id' query parameter. Authentication is required.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            description: "Project ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Membership retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    membership: {
                      type: "array",
                      description: "List of project membership entries.",
                      items: {
                        type: "object",
                        properties: {
                          userSub: {
                            type: "string",
                            example: "auth0|abcdef123456",
                          },
                          role: { type: "string", example: "manager" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing or invalid project ID.",
          },
          "401": {
            description: "Not authenticated.",
          },
          "404": {
            description: "Project not found.",
          },
          "405": {
            description: "Method not allowed.",
          },
          "500": {
            description: "Failed to retrieve project membership.",
          },
        },
      },
    },
    "/api/projects/task": {
      get: {
        tags: ["Tasks"],
        summary: "Get task details",
        description:
          "Retrieves details for a specific task within a project. The project is identified by the 'id' query parameter and the task by the 'taskId' query parameter.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            description: "The project ID.",
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "query",
            required: true,
            description: "The task ID.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Task details retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: {
                      type: "string",
                      example: "60f1b3c6b4d1c4a1d8e9f124",
                    },
                    title: { type: "string", example: "Design homepage" },
                    status: { type: "string", example: "todo" },
                    assignedTo: {
                      oneOf: [
                        { type: "string", example: "auth0|abc123" },
                        { type: "null" },
                      ],
                    },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                      example: "medium",
                    },
                    dueDate: {
                      type: "string",
                      format: "date-time",
                      example: "2025-04-08T20:57:00.109Z",
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Missing or invalid project ID or task ID." },
          "401": { description: "Not authenticated." },
          "403": { description: "User is not a member of the project." },
          "404": { description: "Project or task not found." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to retrieve task details." },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Update a task",
        description:
          "Updates a specific task within a project. The project is identified by the 'id' query parameter and the task by the 'taskId' query parameter. Only the task title, assignedTo, priority, and dueDate fields can be updated.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            description: "The project ID.",
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "query",
            required: true,
            description: "The task ID.",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Updated task title." },
                  assignedTo: {
                    type: "string",
                    description: "User ID to assign the task (optional).",
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Task priority (optional).",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    description: "Due date (optional).",
                  },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated and project data returned.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: {
                      type: "string",
                      example: "60f1b3c6b4d1c4a1d8e9f123",
                    },
                    projectId: { type: "string", example: "project123" },
                    name: { type: "string", example: "Project Alpha" },
                    description: {
                      type: "string",
                      example: "Sample project description",
                    },
                    membership: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          userSub: { type: "string", example: "auth0|abc123" },
                          role: { type: "string", example: "manager" },
                        },
                      },
                    },
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "60f1b3c6b4d1c4a1d8e9f124",
                          },
                          title: { type: "string", example: "Design homepage" },
                          status: { type: "string", example: "todo" },
                          assignedTo: {
                            oneOf: [
                              { type: "string", example: "auth0|abc123" },
                              { type: "null" },
                            ],
                          },
                          priority: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                            example: "medium",
                          },
                          dueDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-08T20:57:00.109Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid task title or parameters." },
          "401": { description: "Not authenticated." },
          "403": { description: "User is not a project member." },
          "404": { description: "Project or task not found." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to update the task." },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        description:
          "Deletes a specific task from a project. The project is identified by the 'id' query parameter and the task by the 'taskId' query parameter.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            description: "The project ID.",
            schema: { type: "string" },
          },
          {
            name: "taskId",
            in: "query",
            required: true,
            description: "The task ID.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description:
              "Task deleted successfully; returns the updated project.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: {
                      type: "string",
                      example: "60f1b3c6b4d1c4a1d8e9f123",
                    },
                    projectId: { type: "string", example: "project123" },
                    name: { type: "string", example: "Project Alpha" },
                    description: {
                      type: "string",
                      example: "Sample project description",
                    },
                    membership: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          userSub: { type: "string", example: "auth0|abc123" },
                          role: { type: "string", example: "manager" },
                        },
                      },
                    },
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "60f1b3c6b4d1c4a1d8e9f124",
                          },
                          title: { type: "string", example: "Design homepage" },
                          status: { type: "string", example: "todo" },
                          assignedTo: {
                            oneOf: [
                              { type: "string", example: "auth0|abc123" },
                              { type: "null" },
                            ],
                          },
                          priority: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                            example: "medium",
                          },
                          dueDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-04-08T20:57:00.109Z",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Missing project ID or task ID." },
          "401": { description: "Not authenticated." },
          "403": { description: "User is not a project member." },
          "404": { description: "Project or task not found." },
          "405": { description: "Method not allowed." },
          "500": { description: "Failed to delete the task." },
        },
      },
    },
  },
};

export default openApiSpec;
