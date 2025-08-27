<?php
require_once __DIR__ . '/../controllers/OfertasController.php';

function route($endpoint, $method) {
    $ofertasController = new OfertasController();

    if ($endpoint === "ofertas" && $method == "GET") {
        $ofertasController->getAll();
    } elseif ($endpoint === "ofertas" && $method == "POST") {
        $ofertasController->create();
    } elseif ($endpoint === "ofertas" && $method == "PUT") {
        $ofertasController->update();
    } elseif ($endpoint === "ofertas" && $method == "DELETE") {
        $ofertasController->delete();
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Ruta no encontrada"]);
    }
}
