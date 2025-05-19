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
