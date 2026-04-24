<?php

class Medico {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllMedicos($search, $uf, $limit, $offset) {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND (nome LIKE :search OR CRM LIKE :search)";
            $params[':search'] = "%{$search}%";
        }
        if (!empty($uf)) {
            $where .= " AND UFCRM = :uf";
            $params[':uf'] = $uf;
        }

        $stmtTotal = $this->db->prepare("SELECT COUNT(*) as total FROM medicos $where");
        $stmtTotal->execute($params);
        $total = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

        $query = "SELECT id, nome, CRM, UFCRM FROM medicos $where LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($query);
        
        foreach($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return [
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC),
            "total" => (int)$total
        ];
    }

    public function getMedicoById($id) {
        $stmt = $this->db->prepare("SELECT id, nome, CRM, UFCRM FROM medicos WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function insertMedico($nome, $crm, $uf) {
        $stmt = $this->db->prepare("INSERT INTO medicos (nome, CRM, UFCRM) VALUES (:nome, :CRM, :UFCRM)");
        $stmt->execute([
            ':nome'  => $nome, 
            ':CRM'   => $crm, 
            ':UFCRM' => $uf
        ]);
        return $this->db->lastInsertId();
    }

    public function updateMedico($id, $nome, $crm, $uf) {
        $stmt = $this->db->prepare("UPDATE medicos SET nome = :nome, CRM = :CRM, UFCRM = :UFCRM WHERE id = :id");
        $stmt->execute([
            ':nome'  => $nome, 
            ':CRM'   => $crm, 
            ':UFCRM' => $uf, 
            ':id'    => $id
        ]);
    }

    public function deleteMedico($id) {
        $stmt = $this->db->prepare("DELETE FROM medicos WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
}
?>