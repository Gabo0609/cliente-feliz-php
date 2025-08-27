<?php
require_once __DIR__ . '/../models/Oferta.php';

class OfertasController {
    public function getAll() {
        $oferta = new Oferta();
        $result = $oferta->getAll();
        echo json_encode($result);
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['titulo'], $data['descripcion'], $data['empresa'])) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan campos obligatorios"]);
            return;
        }

        $oferta = new Oferta();
        $ok = $oferta->create($data);

        if ($ok) {
            echo json_encode(["message" => "Oferta creada correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear la oferta"]);
        }
    }

    public function update() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'], $data['titulo'], $data['descripcion'], $data['empresa'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID y campos obligatorios requeridos"]);
            return;
        }

        $oferta = new Oferta();
        $ok = $oferta->update($data['id'], $data);

        if ($ok) {
            echo json_encode(["message" => "Oferta actualizada correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "No se pudo actualizar"]);
        }
    }

    public function delete() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID requerido para eliminar"]);
            return;
        }

        $oferta = new Oferta();
        $ok = $oferta->delete($data['id']);

        if ($ok) {
            echo json_encode(["message" => "Oferta eliminada correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "No se pudo eliminar"]);
        }
    }
}
