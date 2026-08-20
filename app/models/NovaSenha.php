<?php

class NovaSenha{

    protected function checarExpiracaoToken($selector, $dataAtual){

        return DataBase::table('tb_RedefinirSenha')
        ->select() 
        ->where("Rdf_selector = :selector AND Rdf_dataexpiracao >= :dataAtual", 
        ["selector" => $selector, "dataAtual" => $dataAtual]);

    }

    protected function acharUsuario($id){

        return DataBase::table('tb_usuario')-> select() ->where("Usu_id = :id", ["id" => $id]);     

    }

    protected function atualizarSenhaUsuario($senha, $id){

        $novaSenha = password_hash($senha, PASSWORD_DEFAULT);

        $arr['Usu_senha'] = $novaSenha;

        return DataBase::table('tb_usuario')-> update($arr) ->where("Usu_id = :id", ["id" => $id]);     

    }

    protected function removerToken($id){

        return DataBase::table('tb_RedefinirSenha')-> delete() ->where("Rdf_usuarioid = :id", ["id" => $id]);  

    }

}


?>