const pool = require('../database');

exports.getAllPacientes = async (search, dataFiltro, limit, offset, cpfSearchParam) => {
    let baseQuery = ' FROM pacientes WHERE 1=1';
    const params = [];

    if (search) {
        baseQuery += ' AND (nome LIKE ? OR cpf = ? OR carteirinha LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, cpfSearchParam, searchTerm);
    }

    if (dataFiltro) {
        baseQuery += ' AND dataNascimento = ?';
        params.push(dataFiltro);
    }

    const countQuery = 'SELECT COUNT(*) as total' + baseQuery;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const dataQuery = 'SELECT id, nome, DATE_FORMAT(dataNascimento, "%Y-%m-%d") as dataNascimento, carteirinha, cpf' + baseQuery + ' LIMIT ? OFFSET ?';
    const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

    return { rows, total };
};

exports.getPacienteById = async (id) => {
    const [rows] = await pool.query('SELECT id, nome, DATE_FORMAT(dataNascimento, "%Y-%m-%d") as dataNascimento, carteirinha, cpf FROM pacientes WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
};

exports.createPaciente = async (nome, dataNascimento, carteirinha, cpfEncriptado) => {
    const [result] = await pool.query(
        'INSERT INTO pacientes (nome, dataNascimento, carteirinha, cpf) VALUES (?, ?, ?, ?)',
        [nome, dataNascimento, carteirinha, cpfEncriptado]
    );
    return result.insertId;
};

exports.updatePaciente = async (id, nome, dataNascimento, carteirinha, cpfEncriptado) => {
    await pool.query(
        'UPDATE pacientes SET nome = ?, dataNascimento = ?, carteirinha = ?, cpf = ? WHERE id = ?',
        [nome, dataNascimento, carteirinha, cpfEncriptado, id]
    );
};

exports.deletePaciente = async (id) => {
    await pool.query('DELETE FROM pacientes WHERE id = ?', [id]);
};