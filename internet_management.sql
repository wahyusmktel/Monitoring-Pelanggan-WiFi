-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 25 Nov 2025 pada 23.46
-- Versi server: 11.7.2-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `internet_management`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `odp_id` int(11) DEFAULT NULL,
  `odc_port` int(11) DEFAULT NULL,
  `package_id` int(11) DEFAULT NULL,
  `monthly_fee` decimal(10,2) NOT NULL,
  `status` enum('active','inactive','suspended','pending') DEFAULT NULL,
  `registration_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `customers`
--

INSERT INTO `customers` (`id`, `customer_id`, `name`, `email`, `phone`, `address`, `latitude`, `longitude`, `odp_id`, `odc_port`, `package_id`, `monthly_fee`, `status`, `registration_date`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CUST-001', 'Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 10, Jakarta', -6.2095, 106.846, 2, NULL, 2, 250000.00, 'active', '2024-01-15', 'Customer baru, pembayaran tepat waktu', 1, '2025-11-26 01:18:03', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `odcs`
--

CREATE TABLE `odcs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `olt_id` int(11) NOT NULL,
  `total_ports` int(11) NOT NULL,
  `used_ports` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `odcs`
--

INSERT INTO `odcs` (`id`, `name`, `location`, `latitude`, `longitude`, `olt_id`, `total_ports`, `used_ports`, `type`, `status`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ODC-Central-01', 'Jl. Sudirman Kav. 25, Jakarta', -6.2155, 106.829, 1, 16, 4, 'distribution', 'active', 'ODC untuk area Sudirman', 1, '2025-11-26 01:17:35', NULL),
(2, 'ODC-Central-01', 'Jl. Sudirman Kav. 25, Jakarta', -6.2155, 106.829, 2, 16, 4, 'distribution', 'active', 'ODC untuk area Sudirman', 1, '2025-11-26 01:18:03', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `odps`
--

CREATE TABLE `odps` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `odc_id` int(11) NOT NULL,
  `total_ports` int(11) NOT NULL,
  `used_ports` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `odps`
--

INSERT INTO `odps` (`id`, `name`, `location`, `latitude`, `longitude`, `odc_id`, `total_ports`, `used_ports`, `type`, `status`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ODP-Central-01A', 'Jl. Gatot Subroto Kav. 1A, Jakarta', -6.2095, 106.846, 1, 8, 2, 'distribution', 'active', 'ODP untuk area Gatot Subroto', 1, '2025-11-26 01:17:35', NULL),
(2, 'ODP-Central-01A', 'Jl. Gatot Subroto Kav. 1A, Jakarta', -6.2095, 106.846, 2, 8, 2, 'distribution', 'active', 'ODP untuk area Gatot Subroto', 1, '2025-11-26 01:18:03', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `olts`
--

CREATE TABLE `olts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `total_ports` int(11) NOT NULL,
  `used_ports` int(11) NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `olts`
--

INSERT INTO `olts` (`id`, `name`, `location`, `latitude`, `longitude`, `brand`, `model`, `total_ports`, `used_ports`, `ip_address`, `status`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'OLT-Central-Jakarta', 'Jl. Gatot Subroto Kav. 1A, Jakarta', -6.2088, 106.846, 'Huawei', 'MA5800', 32, 8, '192.168.1.100', 'active', 'OLT utama untuk area Central Jakarta', 1, '2025-11-26 01:17:35', NULL),
(2, 'OLT-Central-Jakarta', 'Jl. Gatot Subroto Kav. 1A, Jakarta', -6.2088, 106.846, 'Huawei', 'MA5800', 32, 8, '192.168.1.100', 'active', 'OLT utama untuk area Central Jakarta', 1, '2025-11-26 01:18:03', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `speed` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `features` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `packages`
--

INSERT INTO `packages` (`id`, `name`, `description`, `speed`, `price`, `features`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Paket Standard', 'Internet stabil untuk keluarga', '20 Mbps', 250000.00, 'Unlimited data, Support 4-6 device', 1, '2025-11-26 01:17:35', NULL),
(2, 'Paket Standard', 'Internet stabil untuk keluarga', '20 Mbps', 250000.00, 'Unlimited data, Support 4-6 device', 1, '2025-11-26 01:18:03', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','paid','overdue','cancelled') DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `monthly_fee` decimal(10,2) NOT NULL,
  `status` enum('active','inactive','suspended','expired') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_customers_email` (`email`),
  ADD UNIQUE KEY `ix_customers_customer_id` (`customer_id`),
  ADD KEY `odp_id` (`odp_id`),
  ADD KEY `package_id` (`package_id`),
  ADD KEY `ix_customers_id` (`id`);

--
-- Indeks untuk tabel `odcs`
--
ALTER TABLE `odcs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `olt_id` (`olt_id`),
  ADD KEY `ix_odcs_id` (`id`);

--
-- Indeks untuk tabel `odps`
--
ALTER TABLE `odps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `odc_id` (`odc_id`),
  ADD KEY `ix_odps_id` (`id`);

--
-- Indeks untuk tabel `olts`
--
ALTER TABLE `olts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_olts_id` (`id`);

--
-- Indeks untuk tabel `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_packages_id` (`id`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `ix_payments_id` (`id`);

--
-- Indeks untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `package_id` (`package_id`),
  ADD KEY `ix_subscriptions_id` (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `odcs`
--
ALTER TABLE `odcs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `odps`
--
ALTER TABLE `odps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `olts`
--
ALTER TABLE `olts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `packages`
--
ALTER TABLE `packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`odp_id`) REFERENCES `odps` (`id`),
  ADD CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);

--
-- Ketidakleluasaan untuk tabel `odcs`
--
ALTER TABLE `odcs`
  ADD CONSTRAINT `odcs_ibfk_1` FOREIGN KEY (`olt_id`) REFERENCES `olts` (`id`);

--
-- Ketidakleluasaan untuk tabel `odps`
--
ALTER TABLE `odps`
  ADD CONSTRAINT `odps_ibfk_1` FOREIGN KEY (`odc_id`) REFERENCES `odcs` (`id`);

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`);

--
-- Ketidakleluasaan untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
