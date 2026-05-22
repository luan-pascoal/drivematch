export function MsgErrosBackEnd({ arrayErrosBackend }) {

    if (!arrayErrosBackend || arrayErrosBackend.length === 0){
        return null;
    }

    return (
        <>
            {arrayErrosBackend.map( (erro) => {

                const campo = erro[0];
                const msg = erro[1];

                return (

                    <p key={campo} className="error-message">
                        {msg}
                    </p>
                    
                );

            })}
        </>

    );

}