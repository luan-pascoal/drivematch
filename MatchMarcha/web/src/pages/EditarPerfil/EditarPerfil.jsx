import { EditarPerfilUsuario } from "./EditarPerfilUsuario";
import { EditarPerfilInstrutor } from "./EditarPerfilInstrutor";

export function EditarPerfil( {usuario, dadosUsuario , msgErro, atualizarUsuario, carregarUsuario} ){
    
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
            />
        );

    }

    return null;

}