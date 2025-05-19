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
