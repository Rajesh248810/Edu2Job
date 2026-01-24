from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import razorpay
from .models import User
import datetime

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # DEBUG: Check which key is being loaded
            key_id = settings.RAZORPAY_KEY_ID
            masked_key = key_id[:8] + "****" if key_id else "None"
            print(f"DEBUG: Using Razorpay Key: {masked_key}")

            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Amount in paise (1 INR = 100 paise)
            # You can make this dynamic based on plan
            amount = 1 * 100 
            currency = 'INR'
            
            data = {
                'amount': amount,
                'currency': currency,
                'receipt': f"receipt_order_{request.user.user_id}_{datetime.datetime.now().timestamp()}",
                'payment_capture': 1 
            }
            
            order = client.order.create(data=data)
            
            return Response({
                'order_id': order['id'],
                'amount': amount,
                'currency': currency,
                'key_id': settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            print(f"DEBUG: Verifying Payment: Order={razorpay_order_id}, Payment={razorpay_payment_id}")
            
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            data = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            # Verify Signature
            try:
                # DEBUG: Manual Signature Check
                import hmac
                import hashlib
                
                if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                     return Response({'error': 'Missing required payment parameters'}, status=status.HTTP_400_BAD_REQUEST)

                msg = "{}|{}".format(razorpay_order_id, razorpay_payment_id)
                secret = str(settings.RAZORPAY_KEY_SECRET).strip() # Access directly and strip whitespace
                
                generated_signature = hmac.new(
                    bytes(secret, 'utf-8'),
                    bytes(msg, 'utf-8'),
                    hashlib.sha256
                ).hexdigest()
                
                if generated_signature == razorpay_signature:
                    # Signature Matches - Payment is VALID
                    print(f"DEBUG: Manual Verification PASSED for Order {razorpay_order_id}")
                    
                    user = request.user
                    user.is_prime = True
                    user.prime_expiry = datetime.datetime.now() + datetime.timedelta(days=365)
                    user.save()
                    
                    # --- SEND WELCOME EMAIL ---
                    try:
                        import requests
                        from .email_templates import PRIME_WELCOME_TEMPLATE
                        
                        email_url = f"{settings.EMAIL_MICROSERVICE_URL}/send-email"
                        email_data = {
                            "to": user.email,
                            "subject": "Welcome to Edo2Job Prime - Your Premium Access is Unlocked!",
                            "body": PRIME_WELCOME_TEMPLATE.format(name=user.name),
                            "type": "html"
                        }
                        headers = {"Authorization": f"Bearer {settings.EMAIL_MICROSERVICE_SECRET}"}
                        
                        # Non-blocking attempt (or short timeout) so we don't delay the response too much
                        print(f"DEBUG: Sending Prime Welcome Email to {user.email}")
                        requests.post(email_url, json=email_data, headers=headers, timeout=5)
                        
                    except Exception as email_error:
                        # Log error but DO NOT fail the payment response
                        print(f"ERROR: Failed to send Prime welcome email: {email_error}")

                    return Response({'message': 'Payment Verified. Membership Upgraded!'}, status=status.HTTP_200_OK)
                else:
                    # Signature Mismatch
                    print(f"DEBUG: Signature Mismatch! Gen: {generated_signature}, Recv: {razorpay_signature}")
                    # Return generic error to user but detailed log was printed
                    return Response({
                        'error': f'Payment Verification Failed: Signature Mismatch. Please contact support.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                print(f"DEBUG: Verification Logic Error: {e}")
                return Response({'error': f'Verification Logic Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
