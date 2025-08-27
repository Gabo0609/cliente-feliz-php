# Cliente Feliz – API en PHP

Este proyecto implementa un backend en PHP para gestionar ofertas de trabajo. La API permite listar, crear, actualizar y eliminar ofertas en una base de datos MySQL. Se desarrolló usando PHP nativo (PDO) y se ejecuta en XAMPP.

## Requisitos
- XAMPP (Apache, MySQL, PHP 8+)
- Postman (para probar la API)

## Instalación y configuración
1. Copiar la carpeta del proyecto dentro de `htdocs` en XAMPP:
2. Iniciar Apache y MySQL desde el panel de XAMPP.
3. Crear la base de datos y la tabla en phpMyAdmin o desde consola MySQL:
```sql
CREATE DATABASE cliente_feliz;
USE cliente_feliz;

CREATE TABLE ofertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    empresa VARCHAR(100) NOT NULL,
    fecha_publicacion DATE DEFAULT CURRENT_DATE
);

INSERT INTO ofertas (titulo, descripcion, empresa) VALUES
("Desarrollador PHP", "Se busca programador PHP con experiencia en APIs", "TechCorp"),
("Diseñador UX/UI", "Encargado de interfaces modernas", "CreativeStudio");

cliente-feliz-php/
│── public/
│   └── index.php
│── src/
│   ├── config/
│   │   └── Database.php
│   ├── controllers/
│   │   └── OfertasController.php
│   ├── models/
│   │   └── Oferta.php
│   └── routes/
│       └── api.php
│── README.md
Endpoints de la API
1. Listar todas las ofertas

Método: GET

URL:
http://localhost/cliente-feliz-php/public/index.php?endpoint=ofertas


Respuesta de ejemplo:

[
  {
    "id": 1,
    "titulo": "Desarrollador PHP",
    "descripcion": "Se busca programador PHP con experiencia en APIs",
    "empresa": "TechCorp",
    "fecha_publicacion": "2025-08-26"
  },
  {
    "id": 2,
    "titulo": "Diseñador UX/UI",
    "descripcion": "Encargado de interfaces modernas",
    "empresa": "CreativeStudio",
    "fecha_publicacion": "2025-08-26"
  }
]

2. Crear una nueva oferta

Método: POST

URL:

http://localhost/cliente-feliz-php/public/index.php?endpoint=ofertas


Headers:

Content-Type: application/json


Body (JSON):

{
  "titulo": "Backend Developer",
  "descripcion": "Se busca programador backend con experiencia en PHP",
  "empresa": "Tech Solutions"
}


Respuesta de ejemplo:

{"message": "Oferta creada correctamente"}

3. Actualizar una oferta

Método: PUT

URL:

http://localhost/cliente-feliz-php/public/index.php?endpoint=ofertas&id=1


Headers:

Content-Type: application/json


Body (JSON):

{
  "titulo": "Backend Developer Senior",
  "descripcion": "Experiencia en PHP y MySQL",
  "empresa": "Tech Solutions"
}


Respuesta de ejemplo:

{"message": "Oferta actualizada correctamente"}

4. Eliminar una oferta

Método: DELETE

URL:

http://localhost/cliente-feliz-php/public/index.php?endpoint=ofertas&id=1


Respuesta de ejemplo:

{"message": "Oferta eliminada correctamente"}

Notas

Revisar el archivo src/config/Database.php y ajustar credenciales si es necesario:

private $username = "root"; 
private $password = ""; // por defecto en XAMPP no tiene contraseña


Todos los endpoints se deben probar con Postman, enviando los datos en formato JSON.

El proyecto debe ejecutarse desde:

http://localhost/cliente-feliz-php/public/index.php