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
