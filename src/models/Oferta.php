<?php
require_once __DIR__ . '/../config/Database.php';

class Oferta {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll() {
        $query = "SELECT * FROM ofertas";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO ofertas (titulo, descripcion, empresa, fecha_publicacion) 
                  VALUES (:titulo, :descripcion, :empresa, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":titulo", $data['titulo']);
        $stmt->bindParam(":descripcion", $data['descripcion']);
        $stmt->bindParam(":empresa", $data['empresa']);

        return $stmt->execute();
    }

    public function update($id, $data) {
        $query = "UPDATE ofertas 
                  SET titulo = :titulo, descripcion = :descripcion, empresa = :empresa 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":titulo", $data['titulo']);
        $stmt->bindParam(":descripcion", $data['descripcion']);
        $stmt->bindParam(":empresa", $data['empresa']);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM ofertas WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
