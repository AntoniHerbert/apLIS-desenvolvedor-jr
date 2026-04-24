const crypto = require('crypto');
const pacienteModel = require('../models/pacienteModel'); 

// ============================================================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================================================
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'apLIS_Clinic_SecretKey_32_Bytes!'; 
const IV = Buffer.alloc(16, 0); 

function encryptCPF(cpf) {
    if (!cpf) return cpf;
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV);
    let encrypted = cipher.update(cpf);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

function decryptCPF(encryptedHex) {
    if (!encryptedHex) return encryptedHex;
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV);
        let decrypted = decipher.update(Buffer.from(encryptedHex, 'hex'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return encryptedHex; 
    }
}

const validarIdParam = (idParam) => {
    const id = parseInt(idParam, 10);
    if (isNaN(id) || id <= 0) return null;
    return id;
};

// ============================================================================
// VALIDAÇÕES DE NEGÓCIO
// ============================================================================
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; 
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
};

const validarDadosPaciente = (nome, dataNascimento, carteirinha, cpf) => {
    if (!nome || !dataNascimento || !carteirinha || !cpf) return 'Todos os campos são obrigatórios.';
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome.trim()) || nome.trim().length < 3) return 'O nome deve conter apenas letras e ter pelo menos 3 caracteres.';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const [ano, mes, dia] = dataNascimento.split('-');
    if (new Date(ano, mes - 1, dia) > hoje) return 'A data de nascimento não pode ser no futuro.';
    if (!/^\d+$/.test(carteirinha.trim())) return 'A carteirinha deve conter apenas números.';
    if (!validarCPF(cpf.replace(/\D/g, ''))) return 'O CPF fornecido é matematicamente inválido.';
    return null;
};

// ============================================================================
// CONTROLADORES
// ============================================================================

exports.getAll = async (req, res) => {
    try {
        const search = req.query.q || '';
        const dataFiltro = req.query.data || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; 
        const offset = (page - 1) * limit;

        const isCpfSearch = search.replace(/\D/g, '').length === 11;
        const cpfSearchParam = isCpfSearch ? encryptCPF(search.replace(/\D/g, '')) : '';

        const { rows, total } = await pacienteModel.getAllPacientes(search, dataFiltro, limit, offset, cpfSearchParam);

        const rowsSeguras = rows.map(paciente => ({
            ...paciente,
            cpf: decryptCPF(paciente.cpf)
        }));

        res.json({ data: rowsSeguras, total: total });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.getById = async (req, res) => {
    const id = validarIdParam(req.params.id);
    if (!id) return res.status(400).json({ mensagem: 'ID inválido. Apenas números inteiros são permitidos.' });

    try {
        const paciente = await pacienteModel.getPacienteById(id);
        if(paciente) {
            paciente.cpf = decryptCPF(paciente.cpf); 
            res.json(paciente);
        } else {
            res.status(404).json({ mensagem: 'Paciente não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.create = async (req, res) => {
    const { nome, dataNascimento, carteirinha, cpf } = req.body;
    
    const erroValidacao = validarDadosPaciente(nome, dataNascimento, carteirinha, cpf);
    if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

    try {
        const cpfEncriptado = encryptCPF(cpf.replace(/\D/g, '')); 
        const carteirinhaLimpa = carteirinha.trim().toUpperCase();

        const insertId = await pacienteModel.createPaciente(nome.trim(), dataNascimento, carteirinhaLimpa, cpfEncriptado);
        
        res.status(201).json({ mensagem: 'Paciente criado com sucesso', id: insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Este CPF ou Carteirinha já está cadastrado.' });
        res.status(500).json({ erro: error.message });
    }
};

exports.update = async (req, res) => {
    const id = validarIdParam(req.params.id);
    if (!id) return res.status(400).json({ mensagem: 'ID inválido. Apenas números inteiros são permitidos.' });

    const { nome, dataNascimento, carteirinha, cpf } = req.body;
    
    const erroValidacao = validarDadosPaciente(nome, dataNascimento, carteirinha, cpf);
    if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

    try {
        const cpfEncriptado = encryptCPF(cpf.replace(/\D/g, ''));
        const carteirinhaLimpa = carteirinha.trim().toUpperCase();

        await pacienteModel.updatePaciente(id, nome.trim(), dataNascimento, carteirinhaLimpa, cpfEncriptado);
        
        res.json({ mensagem: 'Paciente atualizado com sucesso' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Este CPF ou Carteirinha já está cadastrado em outro paciente.' });
        res.status(500).json({ erro: error.message });
    }
};

exports.delete = async (req, res) => {
    const id = validarIdParam(req.params.id);
    if (!id) return res.status(400).json({ mensagem: 'ID inválido. Apenas números inteiros são permitidos.' });

    try {
        await pacienteModel.deletePaciente(id);
        res.json({ mensagem: 'Paciente apagado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};