#!/bin/bash

# Database setup script for Internet Management System
# This script creates the MySQL database and user

echo "Setting up MySQL database for Internet Management System..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "MySQL is not running. Please start MySQL first."
    exit 1
fi

# Create database
echo "Creating database 'internet_management'..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS internet_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user (optional - if you want to create a specific user)
# mysql -u root -e "CREATE USER IF NOT EXISTS 'internet_user'@'localhost' IDENTIFIED BY 'password';"
# mysql -u root -e "GRANT ALL PRIVILEGES ON internet_management.* TO 'internet_user'@'localhost';"

# Grant privileges to root user (since we're using root with no password)
mysql -u root -e "GRANT ALL PRIVILEGES ON internet_management.* TO 'root'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "Database setup completed successfully!"
echo "Database: internet_management"
echo "User: root"
echo "Password: (empty)"
echo ""
echo "Next steps:"
echo "1. Install Python dependencies: pip install -r requirements.txt"
echo "2. Copy .env.example to .env and configure if needed"
echo "3. Run the FastAPI application: python main.py"
echo "4. The database tables will be created automatically when the app starts"