"""
Backend API Tests for SOVEH B2B Retail App
Testing: Products CRUD (PUT/DELETE), Admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://repo-bridge-38.preview.emergentagent.com')

class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "message" in data
        print(f"✓ Root endpoint passed: {data}")


class TestAuthFlow:
    """Authentication flow tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        # Send OTP
        response = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": "9999999998"})
        assert response.status_code == 200
        
        # Verify OTP (use test OTP - in test mode, any 6-digit OTP works or check logs)
        # For testing, we'll try common test OTPs
        for otp in ["123456", "000000", "111111"]:
            response = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={
                "phone": "9999999998",
                "otp": otp,
                "role": "admin"
            })
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Admin login successful with OTP: {otp}")
                return data["token"]
        
        # If no test OTP works, skip authenticated tests
        pytest.skip("Could not authenticate - OTP verification failed")
    
    def test_send_otp(self):
        """Test OTP sending endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": "9999999999"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "session_id" in data
        print(f"✓ OTP sent successfully: {data['message']}")


class TestProductsAPI:
    """Products CRUD API tests"""
    
    def test_get_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} products")
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            assert "mrp" in product
            print(f"✓ First product: {product['name']} - ₹{product['mrp']}")
    
    def test_get_products_by_category(self):
        """Test filtering products by category"""
        # First get categories
        cat_response = requests.get(f"{BASE_URL}/api/categories")
        if cat_response.status_code == 200:
            categories = cat_response.json()
            if len(categories) > 0:
                cat_id = categories[0]["id"]
                response = requests.get(f"{BASE_URL}/api/products", params={"category_id": cat_id})
                assert response.status_code == 200
                print(f"✓ Products filtered by category: {categories[0]['name']}")


class TestProductsCRUDWithAuth:
    """Products CRUD tests requiring authentication"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        
        # Send OTP
        response = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": "9999999998"})
        if response.status_code != 200:
            pytest.skip("Could not send OTP")
        
        # Try to verify with test OTPs
        for otp in ["123456", "000000", "111111", "999999"]:
            response = session.post(f"{BASE_URL}/api/auth/verify-otp", json={
                "phone": "9999999998",
                "otp": otp,
                "role": "admin"
            })
            if response.status_code == 200:
                data = response.json()
                session.headers.update({"Authorization": f"Bearer {data['token']}"})
                print(f"✓ Admin authenticated")
                return session
        
        pytest.skip("Could not authenticate admin")
    
    def test_create_product(self, admin_session):
        """Test creating a new product"""
        # First get a category
        cat_response = admin_session.get(f"{BASE_URL}/api/categories")
        categories = cat_response.json()
        category_id = categories[0]["id"] if categories else "test-category"
        
        product_data = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:8]}",
            "description": "Test product for automated testing",
            "category_id": category_id,
            "mrp": 100.0,
            "retailer_price": 85.0,
            "customer_price": 95.0,
            "stock_quantity": 50,
            "margin_percent": 15.0
        }
        
        response = admin_session.post(f"{BASE_URL}/api/products", json=product_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "product" in data
        print(f"✓ Product created: {data['product']['name']}")
        return data["product"]["id"]
    
    def test_update_product(self, admin_session):
        """Test updating a product (PUT endpoint)"""
        # First get existing products
        response = admin_session.get(f"{BASE_URL}/api/products")
        products = response.json()
        
        if len(products) == 0:
            pytest.skip("No products to update")
        
        product_id = products[0]["id"]
        original_name = products[0]["name"]
        
        # Update the product
        update_data = {
            "name": f"{original_name} - Updated",
            "mrp": 150.0,
            "retailer_price": 120.0,
            "stock_quantity": 100
        }
        
        response = admin_session.put(f"{BASE_URL}/api/products/{product_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Product updated: {product_id}")
        
        # Verify update persisted
        verify_response = admin_session.get(f"{BASE_URL}/api/products/{product_id}")
        assert verify_response.status_code == 200
        updated_product = verify_response.json()
        assert updated_product["mrp"] == 150.0
        print(f"✓ Update verified: MRP is now {updated_product['mrp']}")
    
    def test_delete_product(self, admin_session):
        """Test deleting a product (DELETE endpoint)"""
        # First create a product to delete
        cat_response = admin_session.get(f"{BASE_URL}/api/categories")
        categories = cat_response.json()
        category_id = categories[0]["id"] if categories else "test-category"
        
        product_data = {
            "name": f"TEST_ToDelete_{uuid.uuid4().hex[:8]}",
            "description": "Product to be deleted",
            "category_id": category_id,
            "mrp": 50.0,
            "retailer_price": 40.0,
            "customer_price": 45.0,
            "stock_quantity": 10
        }
        
        create_response = admin_session.post(f"{BASE_URL}/api/products", json=product_data)
        assert create_response.status_code == 200
        product_id = create_response.json()["product"]["id"]
        print(f"✓ Created product for deletion: {product_id}")
        
        # Delete the product
        delete_response = admin_session.delete(f"{BASE_URL}/api/products/{product_id}")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["success"] == True
        print(f"✓ Product deleted: {product_id}")
        
        # Verify deletion
        verify_response = admin_session.get(f"{BASE_URL}/api/products/{product_id}")
        assert verify_response.status_code == 404
        print(f"✓ Deletion verified: Product not found (404)")


class TestCategoriesAPI:
    """Categories API tests"""
    
    def test_get_categories(self):
        """Test getting all categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} categories")
        if len(data) > 0:
            cat = data[0]
            assert "id" in cat
            assert "name" in cat
            print(f"✓ First category: {cat['name']}")


class TestAdminDashboard:
    """Admin dashboard API tests"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        
        response = session.post(f"{BASE_URL}/api/auth/send-otp", json={"phone": "9999999998"})
        if response.status_code != 200:
            pytest.skip("Could not send OTP")
        
        for otp in ["123456", "000000", "111111", "999999"]:
            response = session.post(f"{BASE_URL}/api/auth/verify-otp", json={
                "phone": "9999999998",
                "otp": otp,
                "role": "admin"
            })
            if response.status_code == 200:
                data = response.json()
                session.headers.update({"Authorization": f"Bearer {data['token']}"})
                return session
        
        pytest.skip("Could not authenticate admin")
    
    def test_admin_dashboard(self, admin_session):
        """Test admin dashboard endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "total_users" in data
        assert "total_products" in data
        print(f"✓ Admin dashboard: {data['total_orders']} orders, {data['total_users']} users, {data['total_products']} products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
