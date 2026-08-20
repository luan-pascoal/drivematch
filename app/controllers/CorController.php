<?php

class CorController extends Cor {

    public function listarTodas(){

        $erros = [];
        $dados = [];

        $resultado = $this->listarTodasCores();

        if ($resultado === false || empty($resultado)){
            $erros['bd'] = "Erro interno ao exibir as cores.";
        }

        if (!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        http_response_code(200);
        foreach($resultado as $row){
            $dados[] = [
                "id" => $row->Cor_id,
                "nome" => $row->Cor_nome
            ];
        }
        echo json_encode(["cores" => $dados]);

    }
}

?>