module Collabify
  module Controllers
    class ProjectsController < Sinatra::Base
      before do
        content_type :json
        @svc = ProjectService.new(@current_user)
      end

      get '/projects' do
        @svc.list.to_json
      end

      post '/projects' do
        data = JSON.parse(request.body.read)
        @svc.create(data).to_json
      end

      get '/projects/:id' do |id|
        @svc.find(id).to_json
      end

      put '/projects/:id' do |id|
        data = JSON.parse(request.body.read)
        @svc.update(id, data).to_json
      end

      delete '/projects/:id' do |id|
        @svc.delete(id)
        status 204
      end
    end
  end
end
