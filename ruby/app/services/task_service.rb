module Collabify
  class TaskService
    def initialize(user, project)
      @user, @project = user, project
    end

    def list
      @project.tasks
    end

    def create(attrs)
      @project.tasks.create!(attrs.merge(user: @user))
    end

    def toggle(id)
      t = @project.tasks.find(id)
      t.update!(completed: !t.completed)
      t
    end

    def update(id, attrs)
      t = @project.tasks.find(id)
      t.update!(attrs)
      t
    end

    def delete(id)
      @project.tasks.find(id).destroy!
    end
  end
end
