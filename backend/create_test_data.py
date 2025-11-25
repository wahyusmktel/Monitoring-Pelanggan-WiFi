import requests
import json

# API base URL
BASE_URL = "http://127.0.0.1:8000"

def create_test_data():
    try:
        # Create test OLT
        olt_data = {
            "name": "OLT-Central-Jakarta",
            "location": "Jl. Gatot Subroto Kav. 1A, Jakarta",
            "latitude": -6.2088,
            "longitude": 106.8456,
            "brand": "Huawei",
            "model": "MA5800",
            "total_ports": 32,
            "used_ports": 8,
            "ip_address": "192.168.1.100",
            "status": "active",
            "description": "OLT utama untuk area Central Jakarta",
            "is_active": True
        }
        
        print("Creating OLT...")
        response = requests.post(f"{BASE_URL}/infrastructure/olts", json=olt_data)
        if response.status_code == 200:
            olt = response.json()
            print(f"✅ OLT created: {olt['name']} (ID: {olt['id']})")
        else:
            print(f"❌ Failed to create OLT: {response.status_code} - {response.text}")
            return
            
        # Create test ODC
        odc_data = {
            "name": "ODC-Central-01",
            "location": "Jl. Sudirman Kav. 25, Jakarta",
            "latitude": -6.2155,
            "longitude": 106.8292,
            "olt_id": olt['id'],
            "total_ports": 16,
            "used_ports": 4,
            "type": "distribution",
            "status": "active",
            "description": "ODC untuk area Sudirman",
            "is_active": True
        }
        
        print("Creating ODC...")
        response = requests.post(f"{BASE_URL}/infrastructure/odcs", json=odc_data)
        if response.status_code == 200:
            odc = response.json()
            print(f"✅ ODC created: {odc['name']} (ID: {odc['id']})")
        else:
            print(f"❌ Failed to create ODC: {response.status_code} - {response.text}")
            return
            
        # Create test ODP
        odp_data = {
            "name": "ODP-Central-01A",
            "location": "Jl. Gatot Subroto Kav. 1A, Jakarta",
            "latitude": -6.2095,
            "longitude": 106.8465,
            "odc_id": odc['id'],
            "total_ports": 8,
            "used_ports": 2,
            "type": "distribution",
            "status": "active",
            "description": "ODP untuk area Gatot Subroto",
            "is_active": True
        }
        
        print("Creating ODP...")
        response = requests.post(f"{BASE_URL}/infrastructure/odps", json=odp_data)
        if response.status_code == 200:
            odp = response.json()
            print(f"✅ ODP created: {odp['name']} (ID: {odp['id']})")
        else:
            print(f"❌ Failed to create ODP: {response.status_code} - {response.text}")
            return
            
        # Create test Package
        package_data = {
            "name": "Paket Standard",
            "description": "Internet stabil untuk keluarga",
            "speed": "20 Mbps",
            "price": 250000,
            "features": "Unlimited data, Support 4-6 device",
            "is_active": True
        }
        
        print("Creating Package...")
        response = requests.post(f"{BASE_URL}/services/packages", json=package_data)
        if response.status_code == 200:
            package = response.json()
            print(f"✅ Package created: {package['name']} (ID: {package['id']})")
        else:
            print(f"❌ Failed to create Package: {response.status_code} - {response.text}")
            return
            
        # Create test Customer
        customer_data = {
            "name": "Budi Santoso",
            "email": "budi@email.com",
            "phone": "081234567890",
            "address": "Jl. Merdeka No. 10, Jakarta",
            "latitude": -6.2095,
            "longitude": 106.8465,
            "customer_id": "CUST-001",
            "odp_id": odp['id'],
            "package_id": package['id'],
            "status": "active",
            "monthly_fee": 250000,
            "registration_date": "2024-01-15",
            "installation_date": "2024-01-15",
            "notes": "Customer baru, pembayaran tepat waktu",
            "is_active": True
        }
        
        print("Creating Customer...")
        response = requests.post(f"{BASE_URL}/customers/", json=customer_data)
        if response.status_code == 200:
            customer = response.json()
            print(f"✅ Customer created: {customer['name']} (ID: {customer['id']})")
        else:
            print(f"❌ Failed to create Customer: {response.status_code} - {response.text}")
            return
            
        print("\n🎉 Test data created successfully!")
        print("\nYou can now test the frontend integration:")
        print("- Backend API: http://127.0.0.1:8000/docs")
        print("- Frontend: http://localhost:5173")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")

if __name__ == "__main__":
    create_test_data()