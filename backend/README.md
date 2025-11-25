# Internet Management Backend API

REST API backend untuk aplikasi manajemen internet menggunakan FastAPI dan MySQL.

## Fitur

- ✅ Manajemen Pelanggan (CRUD)
- ✅ Manajemen Infrastruktur (OLT, ODC, ODP)
- ✅ Manajemen Paket Layanan
- ✅ Manajemen Langganan
- ✅ Manajemen Pembayaran
- ✅ Pencarian dan Filter
- ✅ Validasi Data dengan Pydantic
- ✅ Dokumentasi API Otomatis (Swagger/OpenAPI)
- ✅ CORS Support untuk Frontend Integration

## Teknologi

- **FastAPI** - Web framework modern dan cepat
- **SQLAlchemy** - ORM untuk database
- **MySQL** - Database relasional
- **Pydantic** - Validasi data
- **Uvicorn** - ASGI server

## Instalasi

### 1. Setup Database MySQL

Pastikan XAMPP berjalan dan MySQL aktif. Jalankan script setup:

```bash
chmod +x setup_database.sh
./setup_database.sh
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env` dan sesuaikan konfigurasi jika diperlukan:

```bash
cp .env.example .env
```

### 4. Jalankan Aplikasi

```bash
python main.py
```

Atau dengan uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Setelah aplikasi berjalan, buka:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Struktur Database

### Tabel Customers
- id, customer_id, name, email, phone, address, latitude, longitude
- odp_id, odc_port, package_id, monthly_fee, status, registration_date, notes

### Tabel Infrastructure
- **olts**: id, name, location, latitude, longitude, brand, model, total_ports, used_ports, ip_address, status
- **odcs**: id, name, location, latitude, longitude, olt_id, total_ports, used_ports, type, status
- **odps**: id, name, location, latitude, longitude, odc_id, total_ports, used_ports, type, status

### Tabel Services
- **packages**: id, name, description, speed, price, features
- **subscriptions**: id, customer_id, package_id, start_date, end_date, monthly_fee, status
- **payments**: id, customer_id, subscription_id, amount, payment_date, due_date, status, payment_method

## API Endpoints

### Customers
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/{id}` - Get customer by ID
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer
- `GET /customers/stats/status-summary` - Customer status summary

### Infrastructure
- `GET /infrastructure/olts` - List OLTs
- `POST /infrastructure/olts` - Create OLT
- `GET /infrastructure/olts/{id}` - Get OLT by ID
- `PUT /infrastructure/olts/{id}` - Update OLT
- `DELETE /infrastructure/olts/{id}` - Delete OLT
- `GET /infrastructure/hierarchy` - Get infrastructure hierarchy

### Services
- `GET /services/packages` - List packages
- `POST /services/packages` - Create package
- `GET /services/subscriptions` - List subscriptions
- `POST /services/subscriptions` - Create subscription
- `GET /services/payments` - List payments
- `POST /services/payments` - Create payment

## Testing

Gunakan endpoint `/health` untuk memastikan API berjalan:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "Internet Management API"
}
```

## Development

Untuk development mode dengan auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Production

Untuk production deployment:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```