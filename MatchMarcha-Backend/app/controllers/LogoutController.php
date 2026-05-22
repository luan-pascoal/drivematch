<?php

class LogoutController{

    public function fazerLogout(){

    $session = new Session();
    $session->destroy();

    http_response_code(200);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Logout realizado com sucesso"
    ]);

    }

}

?>