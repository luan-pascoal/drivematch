<?php

class Cidade {

    protected function listarTodasCidades(){
        return DataBase::table('Tb_Cidade')->select()->where("1=1");
    }
}

?>

