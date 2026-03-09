import logging
import time
from django.http import HttpResponseForbidden
from django.core.cache import cache

logger = logging.getLogger(__name__)

class BlockMaliciousAgentsMiddleware:
    """
    Blocks well-known malicious user agents like sqlmap, nikto, etc.
    Requested in the security audit.
    """
    MALICIOUS_AGENTS = [
        'sqlmap', 'nikto', 'dirbuster', 'gobuster', 'nmap', 
        'zenmap', 'commix', 'w3af', 'metasploit', 'hydra'
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        for agent in self.MALICIOUS_AGENTS:
            if agent in user_agent:
                logger.warning(f"Blocked malicious user agent: {user_agent} from IP: {request.META.get('REMOTE_ADDR')}")
                return HttpResponseForbidden("Access Denied: Malicious activity detected.")

        return self.get_response(request)

class RateLimitMiddleware:
    """
    Simple rate limiting for sensitive endpoints like login and register.
    Limits to 5 attempts per minute per IP.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        if path in ['/api/login/', '/api/register/', '/api/users/login/', '/api/users/register/']:
            ip = self.get_client_ip(request)
            cache_key = f"rate_limit_{path}_{ip}"
            
            requests_count = cache.get(cache_key, 0)
            if requests_count >= 5:
                logger.warning(f"Rate limit exceeded for {path} from IP: {ip}")
                return HttpResponseForbidden("Too many requests. Please try again in a minute.")
            
            cache.set(cache_key, requests_count + 1, timeout=60)

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_PROTO')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
