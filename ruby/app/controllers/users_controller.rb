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
