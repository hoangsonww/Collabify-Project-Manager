#!/usr/bin/env python

"""
graphql.py

This script demonstrates basic GraphQL operations (queries and mutations)
for the Collabify project management app. It includes operations to fetch
projects, create a project, add a task (with due date and priority), and update
a task. You can extend this script with more operations as needed.

Ensure the following environment variables are set:
- GRAPHQL_ENDPOINT: URL of your GraphQL API (e.g., "http://localhost:4000/graphql")
- AUTH_TOKEN: A valid authorization token to access the API
"""

import os
import sys
import asyncio
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

# Read environment variables
GRAPHQL_ENDPOINT = os.getenv("GRAPHQL_ENDPOINT", "http://localhost:4000/graphql")
AUTH_TOKEN = os.getenv("AUTH_TOKEN", "YOUR_AUTH_TOKEN")

# Configure the GraphQL transport
transport = RequestsHTTPTransport(
    url=GRAPHQL_ENDPOINT,
    headers={"Authorization": f"Bearer {AUTH_TOKEN}"},
    use_json=True,
)

# Initialize the GraphQL client
client = Client(transport=transport, fetch_schema_from_transport=True)


async def fetch_projects():
    """Fetch and print all projects along with their tasks and membership info."""
    query = gql("""
    query {
      projects {
        projectId
        name
        description
        membership {
          userSub
          role
        }
        tasks {
          _id
          title
          status
          priority
          dueDate
        }
      }
    }
    """)
    try:
        result = await client.execute_async(query)
        print("Fetched Projects:")
        print(result)
    except Exception as e:
        print("Error fetching projects:", e)


async def create_project():
    """Create a new project using a GraphQL mutation."""
    mutation = gql("""
    mutation CreateProject($name: String!, $description: String!) {
      createProject(input: { name: $name, description: $description }) {
        projectId
        name
        description
      }
    }
    """)
    variables = {
        "name": "New Collabify Project",
        "description": "Project created via GraphQL script"
    }
    try:
        result = await client.execute_async(mutation, variable_values=variables)
        print("Created Project:")
        print(result)
        return result.get("createProject", {}).get("projectId")
    except Exception as e:
        print("Error creating project:", e)
        return None


async def add_task(projectId: str):
    """Add a new task (with due date) to a given project."""
    mutation = gql("""
    mutation AddTask($projectId: String!, $title: String!, $priority: String!, $dueDate: String!) {
      addTask(projectId: $projectId, input: { title: $title, priority: $priority, dueDate: $dueDate }) {
        _id
        title
        status
        priority
        dueDate
      }
    }
    """)
    # Use a sample due date (you can modify this to your needs)
    sample_due_date = "2025-03-26T12:00:00Z"
    variables = {
        "projectId": projectId,
        "title": "GraphQL Task Example",
        "priority": "medium",
        "dueDate": sample_due_date
    }
    try:
        result = await client.execute_async(mutation, variable_values=variables)
        print("Added Task:")
        print(result)
    except Exception as e:
        print("Error adding task:", e)


async def update_task(taskId: str, newStatus: str):
    """Update a task’s status."""
    mutation = gql("""
    mutation UpdateTask($taskId: String!, $status: String!) {
      updateTask(taskId: $taskId, input: { status: $status }) {
        _id
        title
        status
      }
    }
    """)
    variables = {"taskId": taskId, "status": newStatus}
    try:
        result = await client.execute_async(mutation, variable_values=variables)
        print("Updated Task:")
        print(result)
    except Exception as e:
        print("Error updating task:", e)


async def main():
    # Fetch all projects
    await fetch_projects()

    # Create a new project and then add a task if creation was successful.
    new_project_id = await create_project()
    if new_project_id:
        await add_task(new_project_id)

    # Example: Update a task (uncomment and set valid taskId and newStatus)
    # await update_task("TASK_ID_HERE", "done")


if __name__ == "__main__":
    asyncio.run(main())
