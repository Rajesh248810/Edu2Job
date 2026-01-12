class COOPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # RELAXED FOR GOOGLE LOGIN DEBUGGING
        response['Cross-Origin-Opener-Policy'] = 'unsafe-none' 
        return response
