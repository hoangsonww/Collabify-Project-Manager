#!/usr/bin/env python3

"""
redis_cache.py

A detailed Redis caching module for a Collabify‑like application.
It provides:
  - A caching decorator that serializes function results to JSON.
  - Customizable TTL (time to live) per cache entry.
  - Cache key generation using function name, arguments, and keyword arguments.
  - Manual cache invalidation functions.
  - Logging of cache hits/misses and errors.

Usage:
    @cache(expire=60)
    def get_project_details(project_id):
        # expensive call to fetch project details
        ...
        return result

    # To manually clear cache for a key pattern:
    clear_cache("get_project_details:")
"""

import redis
import json
import functools
import logging
import time
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("redis_cache")

# Configure Redis connection
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)


def generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """Generate a unique cache key based on function name, args, and kwargs."""
    key_data = json.dumps({
        "args": args,
        "kwargs": kwargs
    }, sort_keys=True)
    # Create a hash for the key data to avoid overly long keys
    key_hash = hashlib.md5(key_data.encode()).hexdigest()
    return f"{func_name}:{key_hash}"


def cache(expire: int = 60):
    """
    Decorator to cache the JSON-serializable result of a function.

    :param expire: Expiration time in seconds.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = generate_cache_key(func.__name__, args, kwargs)
            try:
                cached_value = redis_client.get(cache_key)
                if cached_value is not None:
                    logger.info(f"Cache hit for key: {cache_key}")
                    return json.loads(cached_value)
                logger.info(f"Cache miss for key: {cache_key}")
            except Exception as e:
                logger.error(f"Error reading cache for key {cache_key}: {e}")
            result = func(*args, **kwargs)
            try:
                redis_client.set(cache_key, json.dumps(result), ex=expire)
            except Exception as e:
                logger.error(f"Error setting cache for key {cache_key}: {e}")
            return result
        return wrapper
    return decorator


def clear_cache(prefix: str):
    """
    Invalidate all cache entries with keys starting with the given prefix.

    :param prefix: Cache key prefix.
    """
    try:
        keys = redis_client.keys(f"{prefix}*")
        if keys:
            redis_client.delete(*keys)
            logger.info(f"Cleared {len(keys)} keys with prefix {prefix}")
    except Exception as e:
        logger.error(f"Error clearing cache for prefix {prefix}: {e}")


@cache(expire=120)
def get_project_details(project_id: str):
    """
    Simulate an expensive database/network call to fetch project details.
    In a real Collabify app, this would query your project service.
    """
    logger.info(f"Fetching project details for {project_id} from source...")
    time.sleep(2)  # simulate delay
    # Example data structure
    return {
        "projectId": project_id,
        "name": f"Project {project_id}",
        "description": "This is an example project description",
        "tasks": [
            {"_id": "t1", "title": "Setup project", "status": "todo", "priority": "medium", "assignedTo": "auth0|user1"},
            {"_id": "t2", "title": "Design UI", "status": "in-progress", "priority": "high", "assignedTo": "auth0|user2"},
            {"_id": "t3", "title": "Write backend", "status": "done", "priority": "low", "assignedTo": "auth0|user1"},
        ]
    }


@cache(expire=60)
def get_user_info(user_sub: str):
    """
    Simulate fetching user info (name, email) from a user service.
    """
    logger.info(f"Fetching user info for {user_sub} from source...")
    time.sleep(1)  # simulate delay
    # Example info: in a real app, pull from your database or Auth0 Management API
    return {"name": f"User {user_sub[-4:]}", "email": f"{user_sub}@example.com"}


if __name__ == "__main__":
    # Example usage in a Collabify context
    project_id = "fbff1d57"
    logger.info("Getting project details first time (expect delay)...")
    details = get_project_details(project_id)
    logger.info(details)

    logger.info("Getting project details second time (should be cached)...")
    details_cached = get_project_details(project_id)
    logger.info(details_cached)

    # Demonstrate cache invalidation
    clear_cache("get_project_details:")

    logger.info("Getting project details after cache clear (expect delay again)...")
    details_after_clear = get_project_details(project_id)
    logger.info(details_after_clear)
