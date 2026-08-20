<?php
class Veiculo {

    protected function checarCor($cor){

        return DataBase::table('tb_cor')->select()->where("Cor_nome = :cor", ["cor" => $cor]);

    }

    protected function encontrarMarca(){

        $resultado = DataBase::table('tb_marca')->select()->where("Mrc_nome = :marca", ["marca" => $this->marca]);

        return !empty($resultado) ? $resultado[0]->Mrc_id : null;

    }

    protected function criarMarca(){

        $arr = [
            "Mrc_nome" => $this->marca
        ];

        return DataBase::table('tb_marca') -> insert($arr);

    }

    protected function encontrarModelo($marcaId, $ano){

        $resultado = DataBase::table('tb_modelo')->select()->where(
            "Mod_nome = :nome AND Mod_marcaid = :marcaId AND Mod_ano = :ano",
            [
                "nome"    => $this->modelo,
                "marcaId" => $marcaId,
                "ano"     => $ano,
            ]
        );

        return !empty($resultado) ? $resultado[0]->Mod_id : null;

    }

    protected function criarModelo($marcaId, $ano){

        $arr = [
            "Mod_nome" => $this->modelo,
            "Mod_ano" => $ano,
            "Mod_marcaid" => $marcaId
        ];

        return DataBase::table('tb_modelo') -> insert($arr);

    }

    protected function criarVeiculo($cambio, $tipo, $pedalAux, $direcao, $corId, $modeloId, $instrutorId){

        $arr = [
            "Vcl_cambio" => $cambio,
            "Vcl_tipo" => $tipo,
            "Vcl_cilindrada" => $tipo === 'M' ? $this->cilindrada : null,
            "Vcl_pedalAux" => $pedalAux,
            "Vcl_direcao" => $direcao,
            "Vcl_corid" => $corId,
            "Vcl_modeloid"    => $modeloId,
            "Vcl_instrutorid" => $instrutorId,
        ];

        return DataBase::table('tb_veiculo') -> insert($arr);
    }

    protected function listarVeiculos($idInstrutor){

        return DataBase::table('tb_veiculo')->raw("
        SELECT
            v.Vcl_id AS id,
            v.Vcl_tipo AS tipo,
            v.Vcl_cambio AS cambio,
            v.Vcl_direcao AS direcao,
            v.Vcl_pedalaux AS pedalAux,
            v.Vcl_cilindrada AS cilindrada,
            c.Cor_nome AS cor,
            m.Mod_nome AS modelo,
            m.Mod_ano AS ano,
            mc.Mrc_nome AS marca
        FROM tb_veiculo v
        JOIN tb_cor c
            ON c.Cor_id = v.Vcl_corid
        JOIN tb_modelo m
            ON m.Mod_id = v.Vcl_modeloid
        JOIN tb_marca mc
            ON mc.Mrc_id = m.Mod_marcaid
        WHERE v.Vcl_instrutorid = :instrutorid
        ",
        [
            "instrutorid" => $idInstrutor
        ]
    );
    }


    protected function buscarVeiculoDoInstrutor($id, $instrutorId){

        return DataBase::table('tb_veiculo')->raw("
            SELECT Vcl_id AS id
            FROM tb_veiculo
            WHERE Vcl_id = :id
            AND Vcl_instrutorid = :instrutorid
        ",
        [
            "id" => $id,
            "instrutorid" => $instrutorId
        ]);
    }

    protected function atualizarVeiculo($id, $instrutorId, $corId, $pedalAux){

        $dados = [
            "Vcl_corid" => $corId,
            "Vcl_pedalaux" => $pedalAux,
        ];

        return DataBase::table('tb_veiculo')
        ->update($dados)
        ->where("Vcl_id = :id AND Vcl_instrutorid = :instrutorid" , ["id" => $id,  "instrutorid"  => $instrutorId]);
    }

    protected function excluirVeiculo($id, $instrutorId){

        return DataBase::table('tb_veiculo')
        ->delete()
        ->where("Vcl_id = :id AND Vcl_instrutorid = :instrutorid",["id" => $id,  "instrutorid"  => $instrutorId]);

    }

}
?>


