<?php

class Auth {

    public static function verificarUsuarioLogado(){

        if (!isset($_SESSION['USER'])) {
            return false;
        }

        if ($_SESSION['USER']['LOGGED_IN'] == 1){
            return true;
        }

        return false;

    }

    public static function tipoUsuario(){

        if (self::verificarUsuarioLogado()){

            $user = $_SESSION['USER'];
            return $user['tipo'];

        }else {

            return 'visitante';

        }
    }

    public static function autorizacao($restricaoTipo){

        if ($restricaoTipo === 'nenhuma'){
            return true;
        }

        $tipo = self::tipoUsuario();

        if ($tipo === 'usuario' || $tipo === 'instrutor') {

            if ($restricaoTipo === 'logado') {
                return true;
            }

            if ($restricaoTipo === $tipo) {
                return true;
            }
        }
        
        return false;

    }
}

?>
