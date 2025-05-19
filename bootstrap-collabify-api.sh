#!/usr/bin/env bash
set -e

# 1. Create the ruby/ directory and cd into it
mkdir -p ruby && cd ruby

# 2. Initialize a new Gemfile
cat > Gemfile << 'EOF'
source 'https://rubygems.org'

gem 'sinatra',             '~> 2.1'
gem 'mongoid',             '~> 7.3'
gem 'jwt',                 '~> 2.6'
gem 'bcrypt',              '~> 3.1'
gem 'rack-cors',           '~> 1.1'
gem 'dotenv',              '~> 3.3'

group :development do
  gem 'rerun',             '~> 0.14'
  gem 'pry'
end
EOF

# 3. Create config.ru to boot the app
cat > config.ru << 'EOF'
require 'dotenv/load'
require './app/app'
run Collabify::App
EOF

# 4. Create .env.example
cat > .env.example << 'EOF'
# MongoDB URI, e.g. mongodb://localhost:27017/collabify
MONGODB_URI=
# JWT secret for signing tokens
JWT_SECRET=
# Auth0 audience (if integrating Auth0 M2M)
AUTH0_AUDIENCE=
EOF

# 5. Mongoid config
mkdir -p config
cat > config/mongoid.yml << 'EOF'
development:
  clients:
    default:
      uri: <%= ENV['MONGODB_URI'] || 'mongodb://localhost:27017/collabify_development' %>
      options:
        server_selection_timeout: 5
test:
  clients:
    default:
      uri: <%= ENV['MONGODB_URI'] || 'mongodb://localhost:27017/collabify_test' %>
Production:
  clients:
    default:
      uri: <%= ENV['MONGODB_URI'] %>
EOF

# 6. Initializer for JWT
mkdir -p config/initializers
cat > config/initializers/jwt.rb << 'EOF'
require 'jwt'

module Collabify
  module Auth
    SECRET = ENV.fetch('JWT_SECRET') { 'please_set_me' }
    def self.issue(payload, exp = 24*3600)
      payload[:exp] = Time.now.to_i + exp
      JWT.encode(payload, SECRET, 'HS256')
    end
    def self.decode(token)
      decoded, = JWT.decode(token, SECRET, true, { algorithm: 'HS256' })
      decoded
    rescue JWT::DecodeError
      nil
    end
  end
end
EOF

# 7. Application entry point
mkdir -p app
cat > app/app.rb << 'EOF'
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
EOF

# 8. Models
mkdir -p app/models

cat > app/models/user.rb << 'EOF'
module Collabify
  class User
    include Mongoid::Document
    include Mongoid::Timestamps

    field :email,    type: String
    field :password_digest, type: String
    field :role,     type: String, default: 'member'

    validates :email, presence: true, uniqueness: true
    validates :password_digest, presence: true

    has_many :projects
    has_many :tasks

    def password=(pw)
      self.password_digest = BCrypt::Password.create(pw)
    end

    def authenticate(pw)
      BCrypt::Password.new(password_digest) == pw
    end
  end
end
EOF

cat > app/models/project.rb << 'EOF'
module Collabify
  class Project
    include Mongoid::Document
    include Mongoid::Timestamps

    field :name, type: String
    field :description, type: String

    validates :name, presence: true

    belongs_to :user
    has_many :tasks, dependent: :destroy
  end
end
EOF

cat > app/models/task.rb << 'EOF'
module Collabify
  class Task
    include Mongoid::Document
    include Mongoid::Timestamps

    field :title, type: String
    field :details, type: String
    field :completed, type: Boolean, default: false

    validates :title, presence: true

    belongs_to :project
    belongs_to :user
  end
end
EOF

# 9. Services (business logic)
mkdir -p app/services
cat > app/services/project_service.rb << 'EOF'
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
EOF

cat > app/services/task_service.rb << 'EOF'
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
EOF

# 10. Controllers
mkdir -p app/controllers

# Auth
cat > app/controllers/auth_controller.rb << 'EOF'
module Collabify
  module Controllers
    class AuthController < Sinatra::Base
      post '/auth/register' do
        data = JSON.parse(request.body.read)
        user = User.new(email: data['email'])
        user.password = data['password']
        user.save!
        token = Auth.issue(user_id: user.id.to_s)
        { token: token }.to_json
      end

      post '/auth/login' do
        data = JSON.parse(request.body.read)
        user = User.where(email: data['email']).first
        halt 401, { error: 'Invalid credentials' }.to_json unless user&.authenticate(data['password'])
        token = Auth.issue(user_id: user.id.to_s)
        { token: token }.to_json
      end
    end
  end
end
EOF

# Users
cat > app/controllers/users_controller.rb << 'EOF'
module Collabify
  module Controllers
    class UsersController < Sinatra::Base
      get '/users/me' do
        content_type :json
        @current_user.as_document.except('_id','password_digest').to_json
      end
    end
  end
end
EOF

# Projects
cat > app/controllers/projects_controller.rb << 'EOF'
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
EOF

# Tasks
cat > app/controllers/tasks_controller.rb << 'EOF'
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
EOF

# 11. Rakefile for easy tasks
cat > Rakefile << 'EOF'
require 'rake'
require 'mongoid'
Mongoid.load!('config/mongoid.yml', :development)

namespace :db do
  desc 'Drop the development database'
  task :drop do
    Mongoid::Clients.default.database.drop
    puts 'Database dropped'
  end
end
EOF

# 12. Bundle install
bundle install

echo "✅  Collabify API scaffold complete in $(pwd)"
echo " • Run with: cd ruby && JWT_SECRET=your_secret MONGODB_URI=... rerun -- rackup config.ru"
