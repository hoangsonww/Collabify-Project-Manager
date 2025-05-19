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
