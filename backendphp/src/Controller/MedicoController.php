<?php

require_once __DIR__ . '/../Database.php'; 
require_once __DIR__ . '/../Model/Medico.php';

class MedicoController {
    private $medicoModel;

    public function __construct() {
        $db = Database::getConnection();
        $this->medicoModel = new Medico($db); 
    }

    // ============================================================================
    // VALIDAÇÕES
    // ============================================================================
    private function validarId($id) {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);
        if ($idValidado === false || $idValidado <= 0) {
            throw new Exception("ID inválido. Apenas números inteiros são permitidos.", 400);
        }
        return $idValidado;
    }

    private function validarDadosMedico($nome, $crm, $uf) {
        if (empty($nome) || empty($crm) || empty($uf)) return "Todos os campos são obrigatórios.";
        if (!preg_match('/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/u', trim($nome)) || strlen(trim($nome)) < 3) return "O nome deve conter apenas letras e ter pelo menos 3 caracteres.";
        
        $crmLimpo = preg_replace('/\D/', '', $crm);
        if (strlen($crmLimpo) < 4 || strlen($crmLimpo) > 10) return "O CRM deve conter entre 4 e 10 números.";
        
        $ufsValidas = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
        if (!in_array(strtoupper(trim($uf)), $ufsValidas)) return "A UF informada não é válida.";
        
        return null;
    }

    // ============================================================================
    // MÉTODOS DE AÇÃO
    // ============================================================================
    public function getAll($search = '', $page = 1, $limit = 5, $uf = '') {
        $offset = ($page - 1) * $limit;
        return $this->medicoModel->getAllMedicos($search, $uf, $limit, $offset);
    }

    public function getById($id) {
        $idValidado = $this->validarId($id);
        
        $resultado = $this->medicoModel->getMedicoById($idValidado);
        if ($resultado) {
            return $resultado;
        }
        
        throw new Exception("Médico não encontrado.", 404);
    }

    public function create($data) {
        $nome = $data['nome'] ?? '';
        $crm  = $data['CRM'] ?? '';
        $uf   = $data['UFCRM'] ?? '';

        if ($erroValidacao = $this->validarDadosMedico($nome, $crm, $uf)) {
            throw new Exception($erroValidacao, 400);
        }

        try {
            $idCriado = $this->medicoModel->insertMedico(
                trim($nome), 
                preg_replace('/\D/', '', $crm), 
                strtoupper(trim($uf))
            );
            return ["mensagem" => "Médico criado com sucesso.", "id" => $idCriado];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                throw new Exception("Este CRM já está cadastrado nesta UF.", 409);
            }
            throw new Exception("Erro interno do servidor: " . $e->getMessage(), 500);
        }
    }

    public function update($id, $data) {
        $idValidado = $this->validarId($id);

        $nome = $data['nome'] ?? '';
        $crm  = $data['CRM'] ?? '';
        $uf   = $data['UFCRM'] ?? '';

        if ($erroValidacao = $this->validarDadosMedico($nome, $crm, $uf)) {
            throw new Exception($erroValidacao, 400);
        }

        try {
            $this->medicoModel->updateMedico(
                $idValidado,
                trim($nome), 
                preg_replace('/\D/', '', $crm), 
                strtoupper(trim($uf))
            );
            return ["mensagem" => "Médico atualizado com sucesso."];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                throw new Exception("Este CRM já pertence a outro médico nesta UF.", 409);
            }
            throw new Exception("Erro interno do servidor.", 500);
        }
    }

    public function delete($id) {
        $idValidado = $this->validarId($id);
        
        try {
            $this->medicoModel->deleteMedico($idValidado);
            return ["mensagem" => "Médico apagado com sucesso."];
        } catch (PDOException $e) {
            throw new Exception("Erro ao apagar médico. Verifique se ele possui dependências.", 500);
        }
    }
}
?>