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
