<?php

class Cor {

    protected function listarTodasCores(){
        return DataBase::table('Tb_Cor')->select()->where("1=1");
    }
}

?>

