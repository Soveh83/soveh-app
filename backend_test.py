#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class SovehAPITester:
    def __init__(self, base_url="https://repo-bridge-38.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔍 Testing Authentication Flow...")
        
        # Generate test phone number
        test_phone = f"9{str(uuid.uuid4().int)[:9]}"
        
        # Test send OTP
        otp_data = {"phone": test_phone}
        otp_response = self.run_test("Send OTP", "POST", "auth/send-otp", 200, otp_data)
        
        if not otp_response:
            print("❌ Cannot proceed with auth tests - OTP sending failed")
            return False
        
        # Extract OTP from test mode response
        actual_otp = None
        message = otp_response.get('message', '')
        
        # Look for "Test OTP: XXXXXX" pattern in message
        import re
        otp_match = re.search(r'Test OTP: (\d{6})', message)
        if otp_match:
            actual_otp = otp_match.group(1)
            print(f"📱 Extracted test OTP: {actual_otp}")
        
        if not actual_otp:
            print("❌ Could not extract OTP from response")
            return False
        
        # Test verify OTP with extracted OTP
        verify_data = {
            "phone": test_phone,
            "otp": actual_otp,
            "role": "retailer"
        }
        
        verify_response = self.run_test(f"Verify OTP ({actual_otp})", "POST", "auth/verify-otp", 200, verify_data)
        
        if verify_response and verify_response.get('success'):
            self.token = verify_response.get('token')
            self.user_id = verify_response.get('user', {}).get('id')
            print(f"✅ Authentication successful with OTP: {actual_otp}")
            return True
        
        print("❌ Authentication failed with extracted OTP")
        return False

    def test_categories_api(self):
        """Test categories endpoints"""
        print("\n🔍 Testing Categories API...")
        
        # Get categories
        categories = self.run_test("Get Categories", "GET", "categories", 200)
        
        if categories and len(categories) > 0:
            print(f"✅ Found {len(categories)} categories")
            return categories[0].get('id')  # Return first category ID for product tests
        else:
            print("⚠️ No categories found")
            return None

    def test_products_api(self, category_id=None):
        """Test products endpoints"""
        print("\n🔍 Testing Products API...")
        
        # Get all products
        products = self.run_test("Get All Products", "GET", "products", 200)
        
        if products:
            print(f"✅ Found {len(products)} products")
        
        # Get products by category if category_id provided
        if category_id:
            category_products = self.run_test("Get Products by Category", "GET", f"products?category_id={category_id}", 200)
            if category_products:
                print(f"✅ Found {len(category_products)} products in category")
        
        # Get specific product if products exist
        if products and len(products) > 0:
            product_id = products[0].get('id')
            if product_id:
                self.run_test("Get Specific Product", "GET", f"products/{product_id}", 200)
                return product_id
        
        return None

    def test_orders_api(self, product_id=None):
        """Test orders endpoints"""
        print("\n🔍 Testing Orders API...")
        
        # Get user orders
        self.run_test("Get User Orders", "GET", "orders", 200)
        
        # Create test order if we have a product
        if product_id and self.token:
            order_data = {
                "items": [
                    {
                        "product_id": product_id,
                        "product_name": "Test Product",
                        "quantity": 2,
                        "price": 100.0,
                        "total": 200.0
                    }
                ],
                "payment_mode": "cod",
                "delivery_address": {
                    "name": "Test Shop",
                    "phone": "9999999999",
                    "address": "Test Address",
                    "city": "Test City",
                    "pincode": "123456"
                }
            }
            
            order_response = self.run_test("Create Order", "POST", "orders", 200, order_data)
            
            if order_response and order_response.get('success'):
                order_id = order_response.get('order', {}).get('id')
                if order_id:
                    # Test get specific order
                    self.run_test("Get Specific Order", "GET", f"orders/{order_id}", 200)
                    return order_id
        
        return None

    def test_admin_endpoints(self):
        """Test admin-specific endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        if not self.token:
            print("⚠️ Skipping admin tests - no authentication token")
            return
        
        # Test admin dashboard
        self.run_test("Admin Dashboard", "GET", "admin/dashboard", 200)
        
        # Test get all users
        self.run_test("Get All Users", "GET", "admin/users", 200)
        
        # Test pending retailers
        self.run_test("Get Pending Retailers", "GET", "retailers/pending", 200)

    def test_profile_api(self):
        """Test profile endpoints"""
        print("\n🔍 Testing Profile API...")
        
        if not self.token:
            print("⚠️ Skipping profile tests - no authentication token")
            return
        
        # Test get profile
        profile_response = self.run_test("Get Profile", "GET", "profile", 200)
        
        # Test update profile
        profile_update_data = {
            "name": "Test Retailer",
            "shop_name": "Test Shop",
            "email": "test@example.com"
        }
        self.run_test("Update Profile", "PUT", "profile", 200, profile_update_data)
        
        return profile_response

    def test_addresses_api(self):
        """Test address endpoints"""
        print("\n🔍 Testing Addresses API...")
        
        if not self.token:
            print("⚠️ Skipping address tests - no authentication token")
            return
        
        # Test get addresses
        self.run_test("Get Addresses", "GET", "addresses", 200)
        
        # Test add address
        address_data = {
            "type": "shop",
            "name": "Test Shop Address",
            "address": "123 Test Street, Test Area",
            "pincode": "123456",
            "city": "Test City",
            "state": "Test State",
            "is_default": True
        }
        
        address_response = self.run_test("Add Address", "POST", "addresses", 200, address_data)
        
        # If address was created successfully, test delete
        if address_response and address_response.get('success'):
            address_id = address_response.get('address', {}).get('id')
            if address_id:
                self.run_test("Delete Address", "DELETE", f"addresses/{address_id}", 200)
                return address_id
        
        return None

    def test_ai_features(self):
        """Test AI-powered features"""
        print("\n🔍 Testing AI Features...")
        
        if not self.token:
            print("⚠️ Skipping AI tests - no authentication token")
            return
        
        # Test AI recommendations
        recommendations_data = {
            "cart_items": []
        }
        self.run_test("AI Recommendations", "POST", "ai/recommendations", 200, recommendations_data)
        
        # Test AI chat
        chat_data = {
            "message": "What products should I stock for my retail store?"
        }
        self.run_test("AI Chat", "POST", "ai/chat", 200, chat_data)
        
        # Test AI search
        search_data = {
            "query": "rice products"
        }
        self.run_test("AI Smart Search", "POST", "ai/search", 200, search_data)

    def test_credit_endpoints(self):
        """Test credit-related endpoints for retailers"""
        print("\n🔍 Testing Credit Endpoints...")
        
        if not self.token:
            print("⚠️ Skipping credit tests - no authentication token")
            return
        
        # Test credit balance (may fail if user is not a retailer)
        self.run_test("Get Credit Balance", "GET", "credit/balance", 200)
        
        # Test credit ledger
        self.run_test("Get Credit Ledger", "GET", "credit/ledger", 200)

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting SOVEH B2B Retail Supply Network API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        
        # Test basic health
        self.test_health_check()
        
        # Test authentication
        auth_success = self.test_auth_flow()
        
        # Test categories
        category_id = self.test_categories_api()
        
        # Test products
        product_id = self.test_products_api(category_id)
        
        # Test orders
        order_id = self.test_orders_api(product_id)
        
        # Test profile API
        self.test_profile_api()
        
        # Test addresses API
        self.test_addresses_api()
        
        # Test AI features
        self.test_ai_features()
        
        # Test admin endpoints
        self.test_admin_endpoints()
        
        # Test credit endpoints
        self.test_credit_endpoints()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    tester = SovehAPITester()
    results = tester.run_all_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Return appropriate exit code
    return 0 if results["failed_tests"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())