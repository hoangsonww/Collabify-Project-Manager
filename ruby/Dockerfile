# syntax=docker/dockerfile:1

# 1. Base image
FROM ruby:3.1-slim AS builder

# 2. Install system dependencies
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libyaml-dev \
    zlib1g-dev \
    libffi-dev \
    nodejs \
    yarn \
    mongodb-clients \
  && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Install gems
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v '~> 2.3' \
  && bundle config set without 'development test' \
  && bundle install --jobs 4 --retry 3

# 5. Copy application code
COPY . .

# 6. Precompile assets
RUN RAILS_ENV=production bundle exec rails assets:precompile

# 7. Final image
FROM ruby:3.1-slim

# 8. Install runtime dependencies
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends \
    nodejs \
    yarn \
    mongodb-clients \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 9. Copy over the built app from the builder stage
COPY --from=builder /app /app

# 10. Expose port and define entrypoint
EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
