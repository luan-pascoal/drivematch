import { useEffect } from 'react';
import './AlertaSucesso.css';

export function AlertaSucesso( {mensagem, onClose} ){

    useEffect( () =>{

        // Quando passa 3 seg, roda onClose()
        // onClose() => função passada pelo component pai
        const timer = setTimeout( ()=>{
            onClose();
        }, 3000);

        // Limpara o Timeout, em teoria o timer já tinha acabado, mas cancela por segurança
        return () => clearTimeout(timer);

    }, []);

    return(
        <div className="alerta-sucesso">
            {mensagem}
        </div>
    );

}