<?php
require_once __DIR__ . '/../Controller/MedicoController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$base_route = '/api/v1/medicos';


if (strpos($uri, $base_route) === 0) {
    $id = trim(str_replace($base_route, '', $uri), '/');

    try {
        $controller = new MedicoController();

        if ($method === 'GET') {
            if ($id !== '') {
                echo json_encode($controller->getById($id));
            } else {
                $search = $_GET['q'] ?? '';
                $uf = $_GET['uf'] ?? '';
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
                
                echo json_encode($controller->getAll($search, $page, $limit, $uf));
            }
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            http_response_code(201);
            echo json_encode($controller->create($data));
            
        } elseif ($method === 'PUT' && $id !== '') {
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($controller->update($id, $data));
            
        } elseif ($method === 'DELETE' && $id !== '') {
            echo json_encode($controller->delete($id));
            
        } else {
            http_response_code(405);
            echo json_encode(["mensagem" => "Método não permitido ou ID faltando."]);
        }
    } catch (Exception $e) {
        $codigoHttp = $e->getCode() ? $e->getCode() : 500;
        http_response_code($codigoHttp);
        echo json_encode(["mensagem" => $e->getMessage()]);
    }
} else {
    http_response_code(404);
    // O espião: Vai devolver ao React exatamente o caminho que chegou ao PHP!
    echo json_encode([
        "mensagem" => "Rota não encontrada.",
        "caminho_que_chegou_ao_php" => $uri
    ]);
}
?>