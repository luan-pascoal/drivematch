<?php

class InstrutorController extends UsuarioController
{

    private $instrutorModel;
    private $idInstrutor;
    private $cidadeId;
    private $cnh;
    private $periodo;
    private $categoria;
    private $preco;
    private $descricao;

    /************************************************************
    *                        MÉTODOS                            *     
    *        Métodos responsáveis pelas requisições HTTP        *
    ************************************************************/

    public function __construct()
    {
        $this->instrutorModel = new Instrutor();
    }

    private function desfazerCadastro($idUsuario = null, $idInstrutor = null)
    {

        $periodoModel = new Periodo();

        if ($idInstrutor) {
            $periodoModel->removerPeriodosInstrutor($idInstrutor);
            $this->instrutorModel->removerInstrutor($idInstrutor);
        }

        if ($idUsuario) {
            $this->removerUsuario($idUsuario);
        }
    }

    public function cadastrarInstrutor($data)
    {

        $erros = [];

        // Dados de usuário
        $this->nome = $data['nome'] ?? null;
        $this->email = $data['email'] ?? null;
        $this->senha = $data['senha'] ?? null;
        $this->confirmacaoSenha = $data['confirmacaoSenha'] ?? null;
        $this->genero = $data['genero'] ?? null;
        $this->cpf = $data['cpf'] ?? null;
        $this->foto = $data['foto'] ?? null;
        $this->termos = $data['termosUso'] ?? null;
        $this->status_online = "online";

        // Dados de instrutor
        $this->cidadeId = $data['cidade'] ?? null;
        $this->cnh = $data['cnh'] ?? null;
        $this->periodo = $data['periodo'] ?? null;
        if (is_string($this->periodo)) {
            $this->periodo = explode(',', $this->periodo);
        }
        $this->categoria = $data['categoria'] ?? null;
        $this->preco = $data['preco'] ?? null;

        $erros = $this->validarNome($erros);
        $erros = $this->validarEmail($erros);
        $erros = $this->validarSenha($erros);
        $erros = $this->validarConfirmacaoSenha($erros);
        $erros = $this->validarCpf($erros);
        $erros = $this->validarGenero($erros);
        $erros = $this->validarFotoCadastro($erros);
        $erros = $this->validarTermos($erros);

        $erros = $this->validarCidade($erros);
        $erros = $this->validarCnh($erros);
        $erros = $this->validarPeriodoCadastro($erros);
        $erros = $this->validarCategoria($erros);
        $erros = $this->validarPreco($erros);

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $this->foto = $this->salvarFoto($erros);

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $insercaoUsuario = $this->inserirUsuario(
            $this->nome,
            $this->email,
            $this->senha,
            $this->cpf,
            $this->genero,
            $this->foto,
            $this->status_online
        );

        if ($insercaoUsuario === false) {
            $erros["bd"] = "Erro interno ao cadastrar o instrutor. Tente novamente.";
        }

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $this->id = $insercaoUsuario;

        $insercaoInstrutor = $this->instrutorModel->inserirInstrutor(
            $this->id,
            $this->cnh,
            $this->categoria,
            $this->preco,
            $this->cidadeId
        );

        if ($insercaoInstrutor === false) {
            $this->desfazerCadastro($this->id);
            $erros["bd"] = "Erro interno ao cadastrar o instrutor. Tente novamente.";
        }

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $this->idInstrutor = $insercaoInstrutor;

        foreach ($this->periodo as $periodo) {

            $periodoModel = new Periodo();

            $periodoBd = $periodoModel->buscarPeriodo($periodo);

            if ($periodoBd === false || empty($periodoBd)) {
                $this->desfazerCadastro(
                    $this->id,
                    $this->idInstrutor
                );
                http_response_code(422);
                echo json_encode(["Erro" => ["bd" => "Erro interno ao cadastrar o instrutor. Tente novamente."]]);
                return;
            }

            $idPeriodo = $periodoBd[0]->Per_id;

            $resultado = $periodoModel->inserirInstrutorPeriodo(
                $this->idInstrutor,
                $idPeriodo
            );

            if ($resultado === false) {
                $this->desfazerCadastro(
                    $this->id,
                    $this->idInstrutor
                );
                http_response_code(422);
                echo json_encode(["Erro" => ["bd" => "Erro interno ao cadastrar o instrutor. Tente novamente."]]);
                return;
            }
        }

        $session = new Session();

        $session->regenerate();

        $session->set('USER', [
            'id' => $this->id,
            'instrutor_id' => $this->idInstrutor,
            'nome' => $this->nome,
            'email' => $this->email,
            'tipo' => 'instrutor',
            'LOGGED_IN' => 1
        ]);

        http_response_code(200);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Instrutor cadastrado com sucesso"
        ]);

        return;
    }

    public function listarUnicoInstrutor($id){

        $erros = [];
        $this->idInstrutor = $id;

        $resultado = $this->instrutorModel->listarUnicoInstrutor($this->idInstrutor);

        if ($resultado === false || empty($resultado)){
            $erros['bd'] = "Erro interno ao exibir dados do instrutor. Tente novamente.";
        }

        if (!empty($erros)){
            http_response_code(422);
            echo json_encode([
                "Erro" => $erros
            ]);
            return;
        }

        $dados = $resultado[0];
        
        $periodos = [];

        foreach ($resultado as $linha) {
            if ($linha->Per_id !== null) {
                $periodos[] = [
                    "id"   => $linha->Per_id,
                    "nome" => $linha->Per_nome
                ];
            }
        }

        http_response_code(200);
        echo json_encode([
            
            "instrutor" => [
                "idIns" => $dados->Ins_id ?? null,
                "idUsu" => $dados->Usu_id ?? null,
                "nome" => $dados->Usu_nome ?? null,
                "email" => $dados->Usu_email ?? null,
                "descricao" => $dados->Ins_descricao ?? null,
                "cpf" => $dados->Usu_cpf ?? null,
                "cnh" => $dados->Ins_cnh ?? null,
                "genero" => $dados->Usu_genero ?? null,
                "foto" => $dados->Usu_foto ?? null,
                "preco" => $dados->Ins_aulapreco ?? null,
                "tipo" => $dados->Ins_aulatipo ?? null,
                "cidade"  => [
                    "id"   => $dados->Cid_id ?? null,
                    "nome" => $dados->Cid_nome ?? null
                ],
                "periodos" => $periodos
            ]

        ]);

        return;

    }

    public function listarTodos($pagina){

        $instrutorModel = new Instrutor();

        $busca = $_GET['busca'] ?? null;
        $local = $_GET['local'] ?? null;
        $categoria = $_GET['categoria'] ?? null;
        $precoMax  = $_GET['precoMax']  ?? null;

        $porPagina = 12;
        $offset = ((int)$pagina - 1) * $porPagina;

        $resultado = $instrutorModel->listarTodosInstrutor($busca, $local, $categoria, $precoMax, $porPagina, $offset);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => "Falha ao consultar instrutores"]);
            return;
        }
        
        $totalResultado = $instrutorModel->contarTotal($busca, $local, $categoria, $precoMax);

        if($totalResultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => "Falha ao contar instrutores"]);
            return;
        }

        foreach($resultado as $instrutor){
            if(!empty($instrutor->periodos)){
                $periodos = explode(', ', $instrutor->periodos);
                if(count($periodos) > 1){
                    // array_pop() remove o último elemento do array e o retorna para a variável $ultimo.
                    // Ex.: ['Manhã', 'Tarde'] -> $ultimo = 'Tarde' 
                    // $periodos = ['Manhã']
                    $ultimo = array_pop($periodos); 
                    // implode() junta os elementos restantes separados por ", ".
                    // Se restar apenas um elemento, ele apenas retorna esse elemento.
                    // Depois concatenamos " e " com o último período.
                    $instrutor->periodos = implode(', ', $periodos) . ' e ' . $ultimo;
                }
            }
        }

        $total = !empty($totalResultado) ? (int) $totalResultado[0]->total : 0;

        http_response_code(200);
        echo json_encode([
            "Sucesso" => [
            "instrutores" => $resultado,
            "total" => $total,
            "totalPaginas" => (int) ceil($total / $porPagina)
            ]
        ]);

    }

    public function editarInstrutor($data){

        $this->idInstrutor = $_SESSION['USER']['instrutor_id'];
        $this->categoria = $data["categoria"] ?? null;
        $this->preco = $data["preco"] ?? null;
        $this->periodo = $data["periodo"] ?? null;  
        $erros = [];
        $erros = $this->validarCategoria($erros);
        $erros = $this->validarPreco($erros);
        $erros = $this->validarPeriodoUpdate($erros);
        
        if(!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $periodoModel = new Periodo();
        $resultado = $periodoModel->removerPeriodosInstrutor($this->idInstrutor);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro interno ao atualizar o instrutor. Tente novamente."]]);
            return;
        }

        foreach($this->periodo as $periodo){

            $resultado = $periodoModel->inserirInstrutorPeriodo(
                $this->idInstrutor,
                $periodo
            );

            if ($resultado === false) {
                http_response_code(422);
                echo json_encode(["Erro" => ["bd" => "Erro interno ao atualizar o instrutor. Tente novamente."]]);
                return;
            }

        }

        $atualizarInstrutor = $this->instrutorModel->atualizarInstrutor($this->idInstrutor, $this->preco, $this->categoria);

        if($atualizarInstrutor === false){
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro interno ao atualizar o instrutor. Tente novamente."]]);
            return;
        }

        http_response_code(200);
        echo json_encode(["sucesso" => true, "mensagem" => "Perfil atualizado com sucesso!"]);
        return;

    }

    public function editarDescrCidade($data){

        $this->idInstrutor = $_SESSION['USER']['instrutor_id'];
        $this->cidadeId = $data["cidade_id"] ?? null;
        $this->descricao = $data["descricao"] ?? null;
        $erros = [];
        $erros = $this->validarCidade($erros);
        $erros = $this->validarDescricao($erros);

        if (!empty($erros)){
            http_response_code(422);
            echo json_encode(["Erro" => $erros]);
            return;
        }

        $resultado = $this->instrutorModel->atualizarDescrCidade($this->idInstrutor, $this->cidadeId, $this->descricao);

        if($resultado === false){
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro ao atualizar dados do usuário"]]);
            return;
        }

        http_response_code(200);
        echo json_encode(["sucesso" => true, "mensagem" => "Dados alterados com sucesso!"]);
        return;
    }

    public function removerContaInstrutor(){

        $erros = [];
        $this->idInstrutor = $_SESSION['USER']['instrutor_id'];
        $this->id = $_SESSION['USER']['id'];
        $resultado = $this->instrutorModel->removerInstrutor($this->idInstrutor);

        if ($resultado === false) {
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro ao remover instrutor."]]);
            return;
        }

        $removerUsuario = $this->removerUsuario($this->id);

        if ($removerUsuario === false) {
            http_response_code(422);
            echo json_encode(["Erro" => ["bd" => "Erro ao remover instrutor."]]);
            return;
        }

        $session = new Session();
        $session->destroy();
        http_response_code(200);
        echo json_encode(["sucesso" => true, "mensagem" => "Conta removida com sucesso!"]);
        return;

    }


    /************************************************************
    *                        Validações                         *     
    *         Regras de validação dos dados do usuário          *
    ************************************************************/

    public function validarCidade($erros)
    {

        if (empty($this->cidadeId)) {
            $erros["cidade"] = "O campo cidade deve ser preenchido";
            return $erros;
        }

        $cidade = filter_var($this->cidadeId, FILTER_VALIDATE_INT);

        if ($cidade === false) {
            $erros["cidade"] = "Cidade inválida";
            return $erros;
        }

        $resultado = $this->instrutorModel->acharCidade($cidade);

        if ($resultado === false || empty($resultado)) {
            $erros["cidade"] = "Cidade inválida";
            return $erros;
        }

        $this->cidadeId = $cidade;

        return $erros;
    }

    public function validarCnh($erros)
    {

        if (empty($this->cnh)) {
            $erros["cnh"] = "O campo CNH deve ser preenchido";
            return $erros;
        }

        $cnh = preg_replace('/\D/', '', $this->cnh);

        if (strlen($cnh) !== 11) {
            $erros["cnh"] = "CNH inválida";
            return $erros;
        }

        if (preg_match('/(\d)\1{10}/', $cnh)) {
            $erros["cnh"] = "CNH inválida";
            return $erros;
        }

        $this->cnh = $cnh;

        $resultado = $this->instrutorModel->checarCnh($this->cnh);

        if ($resultado === false) {
            $erros["cnh"] = "Erro interno ao verificar a CNH. Tente novamente.";
            return $erros;
        }

        if (!empty($resultado)) {
            $erros["cnh"] = "CNH já cadastrada";
            return $erros;
        }

        return $erros;
    }


    public function validarPeriodoCadastro($erros)
    {

        if (!is_array($this->periodo) || empty($this->periodo)) {
            $erros["periodo"] = "O campo periodo deve ser preenchido";
            return $erros;
        }

        $periodosPermitidos = [
            "manha" => "Manhã",
            "tarde" => "Tarde",
            "noite" => "Noite"
        ];

        $periodosNormalizados = [];

        foreach ($this->periodo as $periodo) {

            $periodo = mb_strtolower(trim($periodo), "UTF-8");

            if (!isset($periodosPermitidos[$periodo])) {
                $erros["periodo"] = "Período inválido";
                return $erros;
            }

            $periodosNormalizados[] = $periodosPermitidos[$periodo];
        }

        // array_unique = remove valores duplicados
        $periodosNormalizados = array_unique($periodosNormalizados);

        $this->periodo = $periodosNormalizados;

        return $erros;
    }

    public function validarPeriodoUpdate($erros){

        if (!is_array($this->periodo) || empty($this->periodo)) {
            $erros["periodo"] = "O campo periodo deve ser preenchido";
            return $erros;
        }

        $periodosSelecionados = array_keys(array_filter($this->periodo));

        if (empty($periodosSelecionados)) {
            $erros["periodo"] = "Selecione ao menos um período";
            return $erros;
        }

        $idsPermitidos = [1, 2, 3];

        foreach ($periodosSelecionados as $id) {
            if (!in_array($id, $idsPermitidos)) {
                $erros["periodo"] = "Período inválido";
                return $erros;
            }
        }

        $this->periodo = $periodosSelecionados;

        return $erros;
    }

    public function validarCategoria($erros)
    {

        if (empty($this->categoria)) {
            $erros["categoria"] = "O campo categoria deve ser preenchido";
            return $erros;
        }

        $categoria = trim($this->categoria);

        $categoria = strtoupper($categoria);

        if ($categoria !== "A" && $categoria !== "B" && $categoria !== "AB") {
            $erros["categoria"] = "Categoria inválida";
            return $erros;
        }

        $this->categoria = $categoria;

        return $erros;
    }

    public function validarPreco($erros)
    {

        if (empty($this->preco)) {
            $erros["preco"] = "O campo preço deve ser preenchido";
            return $erros;
        }

        $preco = trim($this->preco);
        $preco = str_replace(".", "", $preco);   
        $preco = str_replace(",", ".", $preco);  
        $preco = filter_var($preco, FILTER_VALIDATE_FLOAT);

        if ($preco === false) {
            $erros["preco"] = "Preço inválido";
            return $erros;
        }

        $preco = (float)$preco;

        if ($preco <= 0) {
            $erros["preco"] = "Preço inválido";
            return $erros;
        }

        $this->preco = $preco;

        return $erros;
    }

    private function validarDescricao($erros){

        if ($this->descricao === null) {
            return $erros;
        }

        $isString = is_string($this->descricao);

        if(!$isString){
            $erros["descricao"] = "Descrição deve ser uma string";
            return $erros;
        }

        $descricao = trim($this->descricao);
        $descricao = preg_replace("/\n{3,}/", "\n\n", $descricao);

        if($descricao === ''){
            return $erros;
        }

        if (mb_strlen($descricao) > 500) {
            $erros["descricao"] = "A descrição deve ter no máximo 500 caracteres";
            return $erros;
        }

        if (!preg_match("/^[A-Za-zÀ-ÿ0-9\s.,!?()-]+$/u", $descricao)) {
            $erros["descricao"] = "A descrição contém caracteres não permitidos";
            return $erros;
        }

        $this->descricao = $descricao;
        return $erros;
    }
    
}
