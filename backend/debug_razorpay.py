import razorpay
try:
    # Trying with the placeholder keys - EXPECTED TO FAIL usually, unless they are format valid but not active
    client = razorpay.Client(auth=('rzp_test_YourKeyIdHere', 'YourKeySecretHere'))
    # Try to make a dummy call - Fetching an order that doesn't exist or just checking auth
    # Actually client.order.all() might be safer
    client.order.all({'count': 1})
    print("SUCCESS: Connection Established (Surprisingly)")
except Exception as e:
    print(f"FAILED: {e}")
