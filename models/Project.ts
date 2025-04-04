import { Schema, models, model } from "mongoose";

export interface ITask {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  assignedTo?: string | null;
}

export interface IProject {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  members: string[];
  tasks: ITask[];
}

const TaskSchema = new Schema<ITask>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    assignedTo: { type: String, default: null },
  },
  { _id: false },
);

const ProjectSchema = new Schema<IProject>({
  projectId: { type: String, unique: true },
  name: { type: String, required: true },
  description: String,
  members: { type: [String], default: [] },
  tasks: { type: [TaskSchema], default: [] },
});

export const Project =
  models.Project || model<IProject>("Project", ProjectSchema);
