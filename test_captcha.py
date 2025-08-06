import os
import django
from captcha.models import CaptchaStore

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
django.setup()


def test_captcha():
    """Test captcha creation and validation"""
    print("Starting captcha functionality test...")

    try:
        # Create a new captcha
        captcha_key = CaptchaStore.pick()
        print(f"Generated captcha key: {captcha_key}")

        # Get the captcha challenge
        captcha_store = CaptchaStore.objects.get(hashkey=captcha_key)
        challenge = captcha_store.challenge
        response = captcha_store.response
        print(f"Captcha challenge: {challenge}")
        print(f"Expected response: {response}")

        print("Captcha test completed successfully!")
        return True

    except Exception as e:
        print(f"Error testing captcha: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    test_captcha()
