<?php
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../src/config/Database.php";
require_once __DIR__ . "/../src/routes/api.php";

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

route($endpoint, $method);
