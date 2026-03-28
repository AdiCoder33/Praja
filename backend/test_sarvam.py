"""
Diagnostic script to test Sarvam AI integration
Run this to diagnose backend issues: python test_sarvam.py
"""

import sys
import os

print("=" * 60)
print("SARVAM AI DIAGNOSTIC TEST")
print("=" * 60)

# Test 1: Check Python path
print("\n1. Checking Python path...")
print(f"   Current directory: {os.getcwd()}")
print(f"   Script directory: {os.path.dirname(os.path.abspath(__file__))}")

# Test 2: Check if .env file exists
print("\n2. Checking .env file...")
env_path = os.path.join(os.path.dirname(__file__), '../config/.env')
if os.path.exists(env_path):
    print(f"   ✅ .env file found at: {env_path}")
else:
    print(f"   ❌ .env file NOT found at: {env_path}")
    sys.exit(1)

# Test 3: Load environment variables
print("\n3. Loading environment variables...")
from dotenv import load_dotenv
load_dotenv(env_path)

SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')
if SARVAM_API_KEY:
    print(f"   ✅ SARVAM_API_KEY loaded (starts with: {SARVAM_API_KEY[:10]}...)")
else:
    print("   ❌ SARVAM_API_KEY not found in .env")
    sys.exit(1)

# Test 4: Check if sarvamai package is installed
print("\n4. Checking sarvamai package...")
try:
    from sarvamai import SarvamAI
    print("   ✅ sarvamai package installed")
except ImportError as e:
    print(f"   ❌ sarvamai package NOT installed: {e}")
    print("   → Run: pip install sarvamai")
    sys.exit(1)

# Test 5: Try to import ai.sarvam modules
print("\n5. Checking ai.sarvam modules...")
# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from ai.sarvam.chat import chat_with_sarvam, create_fir_system_prompt
    print("   ✅ ai.sarvam.chat module imported")
except Exception as e:
    print(f"   ❌ Failed to import ai.sarvam.chat: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from ai.sarvam.tts import generate_speech_sarvam
    print("   ✅ ai.sarvam.tts module imported")
except Exception as e:
    print(f"   ❌ Failed to import ai.sarvam.tts: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 6: Test Sarvam AI Chat
print("\n6. Testing Sarvam AI Chat...")
try:
    messages = [
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': 'Say hello in one short sentence.'}
    ]
    response = chat_with_sarvam(messages, 'en-IN')
    if response:
        print(f"   ✅ Chat working! Response: {response[:100]}...")
    else:
        print("   ❌ Chat returned None")
except Exception as e:
    print(f"   ❌ Chat failed: {e}")
    import traceback
    traceback.print_exc()

# Test 7: Test Sarvam AI TTS
print("\n7. Testing Sarvam AI TTS...")
try:
    audio = generate_speech_sarvam("Hello, this is a test.", 'en-IN')
    if audio:
        print(f"   ✅ TTS working! Audio length: {len(audio)} characters")
    else:
        print("   ❌ TTS returned None")
except Exception as e:
    print(f"   ❌ TTS failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
