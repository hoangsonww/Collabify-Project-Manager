# ruby/collabify_api.gemspec
Gem::Specification.new do |spec|
  spec.name        = "collabify_api"
  spec.version     = "0.1.0"
  spec.summary     = "Collabify API service (Sinatra + Mongoid + JWT)"
  spec.description = "A full-featured backend API for Collabify, built with Sinatra, Mongoid, JWT authentication, CORS, and dotenv config."
  spec.authors     = ["Son Nguyen"]
  spec.email       = ["hoangson091104@gmail.com"]
  spec.homepage    = "https://github.com/hoangsonww/Collabify-Project-Manager"
  spec.license     = "MIT"

  # include all your code, configs, and scripts
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir[
      "app/**/*.rb",
      "config/**/*.yml",
      "config/initializers/*.rb",
      "Gemfile*",
      "config.ru",
      "Rakefile",
      ".env.example"
    ]
  end

  spec.required_ruby_version = ">= 2.7.0"

  # runtime dependencies
  spec.add_dependency "sinatra",             "~> 2.1"
  spec.add_dependency "mongoid",             "~> 7.3"
  spec.add_dependency "jwt",                 "~> 2.6"
  spec.add_dependency "bcrypt",              "~> 3.1"
  spec.add_dependency "rack-cors",           "~> 1.1"
  spec.add_dependency "dotenv",               "3.3.0"

  # development dependencies
  spec.add_development_dependency "rerun",   "~> 0.14"
  spec.add_development_dependency "pry",     "~> 0.14"

  # metadata to link back to your GitHub repo
  spec.metadata = {
    "github_repo" => "https://github.com/hoangsonww/Collabify-Project-Manager"
  }
end
