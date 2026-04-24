<?php
class Database {
    private static $conn = null;

    public static function getConnection() {
        if (self::$conn === null) {
            $host = getenv('DB_HOST') ?: 'db';
            $db_name = getenv('DB_NAME') ?: 'aplis_db';
            $username = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASSWORD') ?: 'root';

            try {
                self::$conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch(PDOException $exception) {
                throw new Exception("Erro ao ligar à base de dados. Verifique as credenciais.", 500);
            }
        }
        return self::$conn;
    }
}
?>