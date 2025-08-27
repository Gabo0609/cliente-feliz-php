<?php
class Database {
    private $host = "localhost";
    private $db_name = "cliente_feliz";
    private $username = "root";   // en XAMPP es root
    private $password = "";       // sin contraseña por defecto
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch (PDOException $exception) {
            echo json_encode(["error" => "Error en la conexión: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
