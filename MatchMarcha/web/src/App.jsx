import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { HomePage } from './pages/Home/HomePage';
import { Login } from './pages/Login/Login';
import { CadastroAluno } from './pages/CadastroAluno/CadastroAluno';
import { EditarPerfil } from './pages/EditarPerfil/EditarPerfil';
import { EditarFoto } from './pages/EditarPerfil/EditarFoto/EditarFoto';
import { EditarSenha } from './pages/EditarPerfil/EditarSenha/EditarSenha';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {

  window.axios = axios;

  const [usuario, setUsuario] = useState(undefined);
  const [dadosUsuario, setDadosUsuario] = useState(undefined);

  // Busca os dados completos do perfil pelo ID e atualiza o state dadosUsuario
  const buscarDadosUsuario = async (id) => {
    const resposta = await axios.get(`/api/usuarios/${id}`, { withCredentials: true });
    if (resposta.status === 200) {
      setDadosUsuario(resposta.data.usuario);
    }
  };

  // Verifica a sessão ativa (/api/eu), atualiza o state usuario e já carrega o perfil completo via buscarDadosUsuario()
  const carregarUsuario = async () => {
    try {
      const response = await axios.get('/api/eu', { withCredentials: true });
      const dadosLogin = response.data;
      setUsuario(dadosLogin);
      if (dadosLogin?.logado && dadosLogin?.usuario?.id) {
        await buscarDadosUsuario(dadosLogin.usuario.id);
      }
    } catch {
      setUsuario(null);
    }
  };

  // Atualiza só os dados do perfil sem refazer a verificação de sessão 
  const atualizarUsuario = async () => {
    const id = usuario?.usuario?.id;
    if (!id) return;
    await buscarDadosUsuario(id);
  };

  // Roda uma vez na montagem do componente para inicializar a sessão
  useEffect(() => {
    carregarUsuario();
  }, []);

  return (
    <Routes>
      <Route index element={<HomePage usuario={usuario} dadosUsuario={dadosUsuario} carregarUsuario={carregarUsuario} />} />
      <Route path="/cadastro-aluno" element={<CadastroAluno carregarUsuario={carregarUsuario} />} />
      <Route path="/login" element={<Login carregarUsuario={carregarUsuario} />} />
      <Route path="/termos" />
      <Route
        path="/editar-perfil"
        element={
          <PrivateRoute usuario={usuario} tipo="logado">
            <EditarPerfil usuario={usuario} dadosUsuario={dadosUsuario} atualizarUsuario={atualizarUsuario} carregarUsuario={carregarUsuario} />
          </PrivateRoute>
        }
      />
      <Route
        path="/editar-foto"
        element={
          <PrivateRoute usuario={usuario} tipo="logado">
            <EditarFoto dadosUsuario={dadosUsuario} atualizarUsuario={atualizarUsuario} />
          </PrivateRoute>
        }
      />
      <Route 
        path="/editar-senha"
        element={
          <PrivateRoute usuario={usuario} tipo="logado">
              <EditarSenha />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;