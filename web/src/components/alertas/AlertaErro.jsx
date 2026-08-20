import { useEffect } from 'react';
import './AlertaErro.css';

export function AlertaErro( {mensagem, onClose} ){

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
        <div className="alerta-erro">
            {mensagem}
        </div>
    );

}