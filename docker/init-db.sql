-- Database initialization script for EV Delivery Management Platform
-- Creates separate database for each bounded context microservice

SELECT 'CREATE DATABASE ev_vehicle_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ev_vehicle_db')\gexec

SELECT 'CREATE DATABASE ev_customer_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ev_customer_db')\gexec

SELECT 'CREATE DATABASE ev_delivery_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ev_delivery_db')\gexec
