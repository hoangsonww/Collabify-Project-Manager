export type TaskType = {
  _id: string;
  title: string;
  status: string;
};

export type ProjectType = {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  members: string[];
  tasks: TaskType[];
};
