module Collabify
  module Controllers
    class TasksController < Sinatra::Base
      before do
        content_type :json
        project = Project.find(params['project_id'])
        @svc = TaskService.new(@current_user, project)
      end

      get '/projects/:project_id/tasks' do
        @svc.list.to_json
      end

      post '/projects/:project_id/tasks' do
        data = JSON.parse(request.body.read)
        @svc.create(data).to_json
      end

      patch '/projects/:project_id/tasks/:id/toggle' do |proj_id, id|
        @svc.toggle(id).to_json
      end

      put '/projects/:project_id/tasks/:id' do |proj_id, id|
        data = JSON.parse(request.body.read)
        @svc.update(id, data).to_json
      end

      delete '/projects/:project_id/tasks/:id' do |proj_id, id|
        @svc.delete(id)
        status 204
      end
    end
  end
end
