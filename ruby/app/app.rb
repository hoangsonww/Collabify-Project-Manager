require 'sinatra/base'
require 'mongoid'
require 'rack/cors'
require 'dotenv/load'

# Load Mongoid config
Mongoid.load!('config/mongoid.yml', ENV['RACK_ENV'] || :development)

# Require all models, controllers
Dir[File.join(__dir__, '{models,controllers,services}/*.rb')].each { |f| require f }

module Collabify
  class App < Sinatra::Base
    configure do
      enable :logging
      set :show_exceptions, false
      use Rack::Cors do
        allow do
          origins '*'
          resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options]
        end
      end
    end

    before do
      pass if request.path_info.start_with?('/auth')
      auth_header = request.env['HTTP_AUTHORIZATION']
      halt 401, { error: 'Unauthorized' }.to_json unless auth_header && Auth.decode(auth_header.split.last)
      @current_user = User.find(Auth.decode(auth_header.split.last)['user_id'])
    end

    # Mount controllers
    use Controllers::AuthController
    use Controllers::UsersController
    use Controllers::ProjectsController
    use Controllers::TasksController

    # 404
    not_found { content_type :json; halt 404, { error: 'Not Found' }.to_json }

    # Error handler
    error do
      content_type :json
      e = env['sinatra.error']
      status 500
      { error: e.message }.to_json
    end
  end
end
