-- Script de inicialización de la base de datos Medicloud

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'medico', 'recepcion')),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    estado BIT DEFAULT 1 -- 1: Activo, 0: Inactivo
);
GO

-- Tabla de Médicos
CREATE TABLE Medicos (
    id_medico INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    especialidad NVARCHAR(100) NOT NULL,
    telefono NVARCHAR(20),
    estado BIT DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE
);
GO

-- Tabla de Pacientes
CREATE TABLE Pacientes (
    id_paciente INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT UNIQUE, -- Puede ser nulo si el paciente no tiene login web
    documento NVARCHAR(20) NOT NULL UNIQUE,
    nombre NVARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono NVARCHAR(20),
    direccion NVARCHAR(200),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    estado BIT DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE SET NULL
);
GO

-- Tabla de Citas
CREATE TABLE Citas (
    id_cita INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    motivo NVARCHAR(255) NOT NULL,
    observaciones NVARCHAR(MAX),
    estado NVARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id_paciente),
    FOREIGN KEY (id_medico) REFERENCES Medicos(id_medico)
);
GO
