<?php

class EuController {

public function autorizacao(){

    $session = new Session();

    if (!$session->exists('USER')) {
        echo json_encode([
            "logado" => false,
            "tipo" => "visitante",
            "usuario" => null
        ]);
        exit;
    }

    $user = $session->get('USER');

    echo json_encode([
        "logado" => true,
        "tipo" => $user['tipo'] ?? 'usuario',
        "usuario" => [
            "id" => $user['id'] ?? null,
            "nome" => $user['nome'] ?? null,
            "email" => $user['email'] ?? null,
            "tipo" => $user['tipo'] ?? null
        ]
    ]);

}

}


?>