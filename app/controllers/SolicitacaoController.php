<?php

class SolicitacaoController extends Solicitacao{

    private $categoria;
    private $periodo;
    private $regiao;
    private $status;
    private $usuarioId;
    private $instrutorId;

    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    ************************************************************/

    public function criarSolicitacao($data){

        $erros = [];

        $this->instrutorId = $data["instrutorId"];
        $this->categoria = $data["categoria"];
        $this->periodo = $data["periodo"];
        $this->regiao = $data["cidade"];
        $this->usuarioId = $_SESSION['USER']['id'];
        
        $erros = $this->validarInstrutorId($erros);
        $erros = $this->validarUsuarioId($erros);

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $erros = $this->validarCategoria($erros);
        $erros = $this->validarPeriodo($erros);
        $erros = $this->validarRegiao($erros);
       
        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $this->status = "PENDENTE";

        $resultado = $this->inserirSolicitacao(
            $this->categoria,
            $this->periodo,
            $this->regiao,
            $this->status,
            $this->usuarioId,
            $this->instrutorId
        );

        if($resultado === false){
            $erros["bd"] = "Erro interno ao enviar solicitação de aula";
            return $erros;            
        }

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $solicitacaoId = (int)$resultado;

        $pusher = PusherService::getInstance();
        // $pusher->trigger => envia eventos em tempo real para clientes conectados via Pusher Channels 
        // $pusher->trigger($canal, $evento, $data);
        $pusher->trigger(
            'private-instrutor' . $this->instrutorId,
            'nova-solicitacao',
            [
                'id' => $solicitacaoId,
                'categoria' => $this->categoria,
                'periodo' => $this->periodo,
                'regiao' => $this->regiao,
                'status'    => $this->status,
            ]

        );

        http_response_code(200);
        echo json_encode(
            [
                "Sucesso" => true,
                "Mensagem" => "Solicitação de aula enviada com sucesso"
            ]
        );

        return;

    }

    public function listarTodas($pagina){

        $this->instrutorId = $_SESSION['USER']['instrutor_id'];
    
        $status = $_GET['status'] ?? null;

        $statusBd = strtoupper($status);
        $porPagina = 8;
        $offset = ($pagina - 1) * $porPagina;

        $resultado = $this->listarTodasSol($this->instrutorId, $statusBd, $porPagina, $offset);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => "Falha ao consultar solicitações de aula"]);
            return;
        }

        foreach($resultado as $item){
            $item->status = strtolower($item->status);
        }

        $totalPorStatus = $this->contarPorStatus($this->instrutorId, $status);

        if($totalPorStatus === false){
            http_response_code(422);
            echo json_encode(["Erro" => "Falha ao consultar solicitações de aula"]);
            return;            
        }

        $contagens = ["pendente" => 0, "aceita" => 0, "recusada" => 0];

        foreach($totalPorStatus as $linha){

            $chave = strtolower($linha->status);

            if(array_key_exists($chave, $contagens)){
                $contagens[$chave] = (int) $linha->total;
            }

        }

        $total = $this->contarTotal($this->instrutorId, $statusBd);

        if($total === false){
            http_response_code(422);
            echo json_encode(["Erro" => "Falha ao consultar solicitações de aula"]);
            return;
        }

        $total = !empty($total) ? (int) $total[0]->total : 0;

        http_response_code(200);
        echo json_encode([
            "Sucesso" => [
                "solicitacoes" => $resultado,
                "total" => $total,
                "contagens" => $contagens,
                "totalPaginas" => (int) ceil($total/$porPagina)
            ]
        ]);

    }

    public function atualizarStatus($id, $data){

        $erros = [];

        $idSolicitacao = filter_var($id, FILTER_VALIDATE_INT);
        $this->status = $data["status"] ?? null;
        $this->instrutorId = $_SESSION['USER']['instrutor_id'] ?? null;

        if($idSolicitacao === false || empty($idSolicitacao)){
            http_response_code(422);
            echo json_encode(["Erro" => ["id" => "Solicitação inválida"]]);
            return;
        }
        
        $erros = $this->validarStatus($erros);

        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $solicitacao = $this->acharSolicitacao($idSolicitacao);

        if($solicitacao === false || empty($solicitacao)){
            http_response_code(422);
            echo json_encode(["Erro" =>  ["id" => "Solicitação não encontrada"]]);
            return;
        }

        $solicitacao = $solicitacao[0];
        if((int)$solicitacao->Slc_instrutorid !== (int)$this->instrutorId){
            http_response_code(422);
            echo json_encode(["Erro" =>  ["id" => "Você não tem permissão para alterar esta solicitação"]]);
            return;
        }

        if($solicitacao->Slc_status !== "PENDENTE"){
            http_response_code(422);
            echo json_encode(["Erro" =>  ["status" => "Esta solicitação já foi processada"]]);
            return;            
        }

        $resultado = $this->atualizarSolicitacao($idSolicitacao, $this->status);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro interno ao atualizar solicitação"]]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            "Sucesso" => true,
            "Mensagem" => "Solicitação atualizada com sucesso"
        ]);
        return;
       
    }

    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do veículo          *
    ************************************************************/

    public function validarCategoria($erros){

        if (empty($this->categoria)) {
            $erros["categoria"] = "O campo categoria deve ser preenchido";
            return $erros;
        }

        $instrutor = $this->acharInstrutor($this->instrutorId);

        if($instrutor[0]->Ins_aulatipo !== $this->categoria 
        && $instrutor[0]->Ins_aulatipo !== 'AB'){
            $erros["categoria"] = "Este instrutor não oferece essa categoria";
            return $erros;
        }

        return $erros;
    }

    public function validarRegiao($erros){

        if (empty($this->regiao)) {
            $erros["cidade"] = "O campo cidade deve ser preenchido";
            return $erros;
        }

        $cidade = filter_var($this->regiao, FILTER_VALIDATE_INT);

        if ($cidade === false) {
            $erros["cidade"] = "Cidade inválida";
            return $erros;
        }

        $resultado = $this->acharCidade($cidade);

        if ($resultado === false || empty($resultado)) {
            $erros["cidade"] = "Cidade inválida";
            return $erros;
        }

        $this->regiao = $cidade;
        return $erros;
    }

    private function validarPeriodo($erros){

        if(empty($this->periodo)){
            $erros["periodo"] = "O campo deve ser preenchido";
            return $erros;
        }

        $periodosPermitidos = ["Manhã", "Tarde", "Noite"];

        if(!in_array($this->periodo, $periodosPermitidos)){
            $erros["periodo"] = "Período inválido";
            return $erros;
        }

        return $erros;

    }

    private function validarUsuarioId($erros){

        if(empty($this->usuarioId)){
            $erros["usuarioId"] = "Usuário inválido";
            return $erros;
        }

        $usuarioId = filter_var($this->usuarioId, FILTER_VALIDATE_INT);

        $resultado = $this->acharUsuario($usuarioId);

        if($resultado === false || empty($resultado)){
            $erros["usuarioId"] = "Usuário inválido";
            return $erros;
        }

        $solicitacao = $this->checarSolicitacoes($this->usuarioId, $this->instrutorId);

        if($solicitacao !== false && !empty($solicitacao)){
            $erros["usuarioId"] = "Você já possui uma solicitação pendente com este instrutor";
            return $erros;
        }

        $this->usuarioId = $usuarioId;
        return $erros;

    }

    private function validarInstrutorId($erros){

        if(empty($this->instrutorId)){
            $erros["instrutorId"] = "Instrutor inválido";
            return $erros;
        }

        $instrutorId = filter_var($this->instrutorId, FILTER_VALIDATE_INT);

        $resultado = $this->acharInstrutor($instrutorId);

        if($resultado === false || empty($resultado)){
            $erros["instrutorId"] = "Instrutor inválido";
            return $erros;
        }

        if((int)$resultado[0]->Ins_usuarioid === (int)$this->usuarioId){
            $erros["usuarioId"] = "Você não pode solicitar uma aula para si mesmo";
            return $erros;
        }

        $this->instrutorId = $instrutorId;
        return $erros;
        
    }

    private function validarStatus($erros){

        if(empty($this->status)){
            $erros["status"] = "O status deve ser informado";
            return $erros;
        }

        $statusPermitidos = ["ACEITA", "RECUSADA"];

        if(!in_array($this->status, $statusPermitidos)){
            $erros["status"] = "Status inválido";
            return $erros;
        }

        return $erros;

    }
}

?>