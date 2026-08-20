import { EditarPerfilUsuario } from "./EditarPerfilUsuario";
import { EditarPerfilInstrutor } from "./EditarPerfilInstrutor";

export function EditarPerfil( {usuario, dadosUsuario , msgErro, atualizarUsuario, carregarUsuario, cidades} ){
    
    if (!usuario){
        return null;
    }

    const user = usuario.usuario;

    if (user.tipo === 'usuario'){

        return(
            <EditarPerfilUsuario
                dadosUsuario={dadosUsuario} 
                msgErro={msgErro} 
                atualizarUsuario={atualizarUsuario}
                carregarUsuario={carregarUsuario}
                usuario={usuario}
            />
        );

    }

    if (user.tipo === 'instrutor'){

        return (
            <EditarPerfilInstrutor 
                dadosUsuario={dadosUsuario} 
                msgErro={msgErro}
                atualizarUsuario={atualizarUsuario} 
                carregarUsuario={carregarUsuario}
                cidades={cidades}
                usuario={usuario}
            />
        );

    }

    return null;

}