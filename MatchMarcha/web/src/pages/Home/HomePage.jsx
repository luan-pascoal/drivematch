import axios from 'axios';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertaSucesso } from '../../components/AlertaSucesso';
import './HomePage.css';

export function HomePage({ usuario, dadosUsuario, carregarUsuario }) {


    const [alertaSucesso, setAlertaSucesso] = useState("");
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {

        if (location.state?.msgSucesso) {
            setAlertaSucesso(location.state.msgSucesso);
        }

    }, [])

    const fazerLogout = async () => {
        await axios.delete('/api/logout');
        await carregarUsuario();
        navigate('/');
    }

    if (!usuario || !usuario.logado) {
        return (
            <>
                {alertaSucesso && (
                    <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso("")} />
                )}
                <p>Você não está logado</p>
                <Link to="/login">
                    <button className="botão-login">Login</button>
                </Link>
            </>
        );
    }

    if (usuario.logado) {
        return (
            <>
                {alertaSucesso && (
                    <AlertaSucesso mensagem={alertaSucesso} onClose={() => setAlertaSucesso("")} />
                )}
                <p>Logado: {dadosUsuario?.nome}</p>
                <Link to="/editar-perfil">
                    <button className="botão-editar-perfil">
                        Editar Perfil
                    </button>
                </Link>
                <button className="botão-login" onClick={fazerLogout}>
                    Logout
                </button>
            </>
        );
    }



}