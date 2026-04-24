CREATE TABLE IF NOT EXISTS medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    CRM VARCHAR(50) NOT NULL,
    UFCRM VARCHAR(2) NOT NULL,
    UNIQUE KEY unique_crm_uf (CRM, UFCRM)
);

CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    dataNascimento DATE NOT NULL,
    carteirinha VARCHAR(15) UNIQUE NOT NULL,
    cpf VARCHAR(64) UNIQUE NOT NULL
);

-- Índices para otimizar as buscas no frontend
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_cpf  ON pacientes(cpf);
CREATE INDEX idx_medicos_nome   ON medicos(nome);