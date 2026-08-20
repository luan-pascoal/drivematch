<?php

class Usuario {

    protected function checarEmail($email){

        return DataBase::table('tb_usuario') -> select() -> where("Usu_email = :email", ["email" => $email]);

    }

    protected function checarCpf($cpf){

        return DataBase::table('tb_usuario') -> select() -> where("Usu_cpf = :cpf", ["cpf" => $cpf]);

    }

    protected function inserirUsuario($nome, $email, $senha, $cpf, $genero, $foto, $status_online){

        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        $arr = [
            "Usu_nome" => $nome, 
            "Usu_email" => $email, 
            "Usu_senha" => $senhaHash, 
            "Usu_cpf" => $cpf, 
            "Usu_genero" => $genero, 
            "Usu_foto" => $foto,
            "Usu_statusonline" => $status_online
        ];
        
        return DataBase::table('tb_usuario') -> insert($arr);

    }

    public function acharUsuario($email){

        return DataBase::table('tb_usuario')->select()->where("Usu_email = :email", ["email" => $email]);

    }

    protected function listarUsuario($id){

        return DataBase::table('tb_usuario')->select()->where("Usu_id = :id", ["id" => $id]);

    }

    protected function atualizarUsuario($id, $nome, $email, $genero){

        $dados = [
            "Usu_nome" => $nome,
            "Usu_email" => $email,
            "Usu_genero" => $genero
        ];

        return DataBase::table('tb_usuario')->update($dados)->where("Usu_id = :id", ["id" => $id]);

    }

    protected function atualizarFoto($id, $foto){

        $dados = [
            "Usu_foto" => $foto
        ];

        return DataBase::table('tb_usuario')->update($dados)->where("Usu_id = :id", ["id" => $id]);

    }

    protected function atualizarSenha($id, $senha){

        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        $dados = [
            "Usu_senha" => $senhaHash
        ];

        return DataBase::table('tb_usuario')->update($dados)->where("Usu_id = :id", ["id" => $id]);

    }

    protected function removerUsuario($id){

        return DataBase::table('tb_usuario')->delete()->where("Usu_id = :id", ["id" => $id]);

    }


}

?>

