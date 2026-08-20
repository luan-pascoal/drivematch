import Pusher from 'pusher-js';

/* 
Aq instanciamos a classe Pusher, criando de fato a conexão
Sintaxe:
const pusher = new Pusher("APP_KEY", {
  cluster: "APP_CLUSTER",
  channelAuthorization:{
  }
});

channelAuthorization: objeto que agrupa toda a configuração de como autenticar canais privados/presenciais

transport : método de transporte de autenticação

endpoint: url do endpoint de autenticação

customHandler : monta a requisição de autenticação

({ socketId, channelName }, callback): dois parâmetros, o primeiro deles é um objeto com socketId e channelName, o
pusher-js é quem chama essa função automaticamente, e é ele quem preenche esse objeto com o id da conexão WebSocket atual 
(socketId) e o nome do canal(channelName) que precisa ser autorizado
callback, uma função que você precisa chamar manualmente no final, avisando o pusher-js se a autenticação deu certo ou errado.
*/

function criarPusherClient() {
    return new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        channelAuthorization: {
            transport: 'ajax',
            endpoint: 'http://localhost/MatchMarcha/api/pusher/auth',
            customHandler: ({ socketId, channelName }, callback) => {
                fetch('http://localhost/MatchMarcha/api/pusher/auth', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channelName,
                    }),
                })
                    .then((res) => res.json().then((data) => ({ status: res.status, data })))
                    .then(({ status, data }) => {
                        if (status === 200) {
                            callback(null, data);
                        } else {
                            callback(new Error(data.Erro || 'Falha ao autenticar canal'), null);
                        }
                    })
                    .catch((err) => callback(err, null));
            },
        },
    });
}

export const pusherClient = import.meta.hot?.data.pusherClient ?? criarPusherClient();

if (import.meta.hot) {
    import.meta.hot.data.pusherClient = pusherClient;

    import.meta.hot.dispose(() => {
        // Roda só quando o módulo é substituído por HMR
        // Não desconecta aqui — só passamos a instância adiante via hot.data
    });
}