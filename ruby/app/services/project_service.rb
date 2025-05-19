module Collabify
  class ProjectService
    def initialize(user)
      @user = user
    end

    def list
      @user.projects
    end

    def create(attrs)
      @user.projects.create!(attrs)
    end

    def find(id)
      @user.projects.find(id)
    end

    def update(id, attrs)
      p = find(id)
      p.update!(attrs)
      p
    end

    def delete(id)
      find(id).destroy!
    end
  end
end
