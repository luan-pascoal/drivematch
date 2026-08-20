<?php

class CidadeController extends Cidade{

    public function listarTodas(){
        
        $erros = [];
        $dados = [];

        $resultado = $this->listarTodasCidades();

        if ($resultado === false || empty($resultado)){
            $erros['bd'] = "Erro interno ao exibir as cidades.";
        }

        if (!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        http_response_code(200);
        foreach($resultado as $row){
            $dados[] = [
                "id" => $row->Cid_id,
                "nome" => $row->Cid_nome,
                "uf"=> $row->Cid_UF
            ];
        }
        echo json_encode(["cidades" => $dados]);

    }

}

?>