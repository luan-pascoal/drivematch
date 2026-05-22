import { Navigate } from 'react-router';

// children : representa tudo que foi colocado entre a abertura e o fechamento de um component

/* ex: 
<PrivateRoute> 
<EditarPerfil />
</PrivateRoute>

PrivateRoute({
children: <EditarPerfil />
})

*/

export function PrivateRoute( {children, tipo, usuario} ) {

    if (usuario === undefined) {
        return <h1>Carregando...</h1>;
    }

    if (!usuario || !usuario.logado) {
        return <Navigate to="/login" />;
        // + msg de acesso negado
    }

    if (tipo === "logado" && (usuario.tipo === "usuario" || usuario === "instrutor") ){
        return children;
    }

    if (tipo === "usuario" && usuario.tipo === "usuario"){
        return children;
    }

    if (tipo === "instrutor" && usuario.tipo === "instrutor"){
        return children;
    }


    return <Navigate to="/login" />
    // + msg de acesso negado

}