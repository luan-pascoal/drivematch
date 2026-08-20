<?php

class VeiculoController extends Veiculo {

    protected $tipo;
    protected $marca;
    protected $modelo;
    protected $ano;
    protected $cambio;
    protected $direcao;
    protected $cor;
    protected $cilindrada;
    protected $pedalAux;

    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    ************************************************************/

    public function cadastrar($data){

        $erros = [];

        $this->tipo       = $data['tipo'] ?? null;
        $this->marca      = $data['marcaNome'] ?? null;
        $this->modelo     = $data['modeloNome'] ?? null;
        $this->ano        = $data['anoNome'] ?? null;
        $this->cambio     = $data['cambio'] ?? null;
        $this->direcao    = $data['direcao'] ?? null;
        $this->cor        = $data['cor'] ?? null;
        $this->pedalAux   = $data['pedalAux'] ?? null;
        $this->cilindrada = $data['cilindrada'] ?? null;
        
        $erros = $this->validarTipo($erros);
        $erros = $this->validarMarca($erros);
        $erros = $this->validarModelo($erros);
        $erros = $this->validarAno($erros);
        $erros = $this->validarCambio($erros);
        $erros = $this->validarDirecao($erros);
        $erros = $this->validarCor($erros);

        if($this->tipo === "C"){
            $erros = $this->validarPedalAux($erros);
        }

        if($this->tipo === "M"){
            $erros = $this->validarCilindrada($erros);
        }
        
        if (!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $anoNumerico = intval(substr($this->ano, 0, 4));
        $marcaId     = intval($this->encontrarMarca() ?? $this->criarMarca());
        $modeloId    = intval($this->encontrarModelo($marcaId, $anoNumerico) ?? $this->criarModelo($marcaId, $anoNumerico));

        $cor = $this->checarCor($this->cor);
        $corId = $cor[0]->Cor_id;

        $instrutorId = $_SESSION['USER']['instrutor_id'];

        $resultado = $this->criarVeiculo(
            $this->cambio,
            $this->tipo,
            $this->pedalAux,
            $this->direcao,
            $corId,
            $modeloId,
            $instrutorId
        );

        if($resultado === false){
            $erros["bd"] = "Erro interno ao cadastrar o veículo. Tente novamente.";
        }

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        http_response_code(200);
        echo json_encode(["sucesso" => true]);

    }

    public function listarTodos($id){

        $erros = [];

        $resultado = $this->listarVeiculos($id);

        if($resultado === false){
            $erros['bd'] = "Erro interno ao exibir os veículos. Tente novamente.";
        }

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode([
                "Erro" => $erros
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            "Sucesso" => [
                "veiculos" => $resultado
            ]
        ]);

    }


    public function editarVeiculo($id, $data){

        $erros = [];

        $instrutorId = $_SESSION['USER']['instrutor_id'];

        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode([
                "Erro" => ["id" => "Veículo inválido."]
            ]);
            return;
        }

        $id = (int) $id;
        $this->cor = $data["cor"] ?? null;
        $this->pedalAux = $data["pedalAux"] ?? null;

        $erros = $this->validarCor($erros);
        $erros = $this->validarPedalAux($erros);

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode([
                "Erro" => $erros
            ]);
            return;
        }

        // Pega o id da cor
        $cor = $this->checarCor($this->cor);
        $corId = $cor[0]->Cor_id;

        $veiculo = $this->buscarVeiculoDoInstrutor($id, $instrutorId);

        if($veiculo === false){
            $erros['bd'] = "Erro interno ao buscar o veículo. Tente novamente.";
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        if(empty($veiculo)){
            $erros['bd'] = "Veículo não encontrado";
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $resultado = $this->atualizarVeiculo($id, $instrutorId, $corId, $this->pedalAux);

        if($resultado === false){
            http_response_code(422);
            echo json_encode([
                "Erro" => ["bd" => "Erro interno ao atualizar o veículo. Tente novamente."]
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Veículo atualizado com sucesso."
        ]);
        
    }

    public function removerVeiculo($id){

        $erros = [];
        $idInstrutor = $_SESSION['USER']['instrutor_id'];

        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode([
                "Erro" => ["id" => "Veículo inválido."]
            ]);
            return;
        }

        $id = (int)$id;

        $veiculo = $this->buscarVeiculoDoInstrutor($id, $idInstrutor);

        if($veiculo === false){
            $erros['bd'] = "Erro interno ao remover o veículo. Tente novamente.";
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        if(empty($veiculo)){
            $erros['bd'] = "Veículo não encontrado";
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $resultado = $this->excluirVeiculo($id, $idInstrutor);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro interno ao remover o veículo. Tente novamente."]]);
            return;
        }

        http_response_code(200);
        echo json_encode(["sucesso" => true, "mensagem" => "Veículo removido com sucesso!"]);
        return;
        
    }

    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do veículo          *
    ************************************************************/

    private function validarTipo($erros){

        if(empty($this->tipo)){
            $erros["tipo"] = "Você deve selecionar o tipo do veículo";
            return $erros;
        }

        $tipo = trim($this->tipo);

        $tipo = strtoupper($tipo);

        if ($tipo !== "C" && $tipo != "M"){
            $erros["tipo"] = "Tipo de veículo inválido";
            return $erros;
        }

        $this->tipo = $tipo;
        return $erros;

    }

    private function validarMarca($erros){
        
        if (empty($this->marca)){
            $erros["marca"] = "Você deve selecionar a marca do veículo";
            return $erros;
        }

        if(!preg_match("/^[A-Za-zÀ-ÿ\s\d\.\-]+$/", $this->marca)){
            $erros["marca"] = "Marca Inválida";
            return $erros;
        }

        return $erros;

    }


    private function validarModelo($erros){

        if (empty($this->modelo)){
            $erros["modelo"] = "Você deve selecionar o modelo do veículo";
            return $erros;
        }

        if(!preg_match("/^[A-Za-zÀ-ÿ0-9\s\.\-\/\+\(\)\,]+$/", $this->modelo)){
            $erros["modelo"] = "Modelo Inválido";
            return $erros;
        }

        return $erros;
    }

    private function validarAno($erros){

        if (empty($this->ano)){
            $erros["ano"] = "Você deve selecionar o ano do veículo";
            return $erros;
        }

        if(!preg_match("/^[A-Za-zÀ-ÿ\s\d]+$/", $this->ano)){
            $erros["ano"] = "Ano Inválido";
            return $erros;
        }

        return $erros;
    }

    private function validarCambio($erros){

        if (empty($this->cambio)){
            $erros["cambio"] = "Você deve selecionar o tipo de câmbio do veículo";
            return $erros;
        }

        $cambiosPermitidos = [
            "Manual",
            "Automático",
            "CVT",
            "Semi-automático"
        ];

        if(!in_array($this->cambio, $cambiosPermitidos)){
            $erros["cambio"] = "Tipo de câmbio inválido";
            return $erros;
        }

        return $erros;

    }

    private function validarDirecao($erros){

        if(empty($this->direcao)){
            $erros["direcao"] = "Você deve selecionar o tipo de direção do veículo";
            return $erros;
        }

        $direcaoPermitidas = [
            "Hidráulica",
            "Elétrica",
            "Mecânica",
            "Eletro-hidráulica"
        ];

        if(!in_array($this->direcao, $direcaoPermitidas)){
            $erros["direcao"] = "Tipo de direção inválida";
            return $erros;
        }

        return $erros;

    }

    private function validarCor($erros){

        if(empty($this->cor)){
            $erros["cor"] = "Você deve selecionar a cor do veículo";
            return $erros;
        }

        $resultado = $this->checarCor($this->cor);

        if(empty($resultado)){
            $erros["cor"] = "Cor inválida";
            return $erros;
        }

        return $erros;
    }


    private function validarPedalAux($erros){

        if(!is_bool($this->pedalAux)){
            $erros["pedalAux"] = "Pedal auxiliar inválido";
            return $erros;
        }

        $this->pedalAux = $this->pedalAux ? 'S' : 'N';
        return $erros;
    }


    private function validarCilindrada($erros) {
        
        if (empty($this->cilindrada)) {
            $erros["cilindrada"] = "Cilindrada é obrigatória para motos";
            return $erros;
        }

        if (!is_numeric($this->cilindrada)) {
            $erros["cilindrada"] = "Cilindrada deve ser um número";
            return $erros;
        }

        $cilindrada = intval($this->cilindrada);

        if ($cilindrada < 50 || $cilindrada > 2000) {
            $erros["cilindrada"] = "Cilindrada deve ser entre 50 e 2000 cc";
            return $erros;
        }

        $this->cilindrada = $cilindrada;
        return $erros;
    }

}
?>

