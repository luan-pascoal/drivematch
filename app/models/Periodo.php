<?php

 class Periodo{

    public function buscarPeriodo($periodo){

        return DataBase::table('tb_periodo')->select()->where("Per_nome = :periodo", ["periodo" => $periodo]);

    }

    public function inserirInstrutorPeriodo($idInstrutor, $idPeriodo){

        $arr = [
            "Inp_instrutorid" => $idInstrutor,
            "Inp_periodoid" => $idPeriodo
        ];

        return DataBase::table('tb_instrutorperiodo')->insert($arr);

    }

    public function removerPeriodosInstrutor($idInstrutor){

        return DataBase::table('tb_instrutorperiodo')->delete()->where("Inp_instrutorid = :idInstrutor",["idInstrutor" => $idInstrutor]);
        
    }

}

?>


