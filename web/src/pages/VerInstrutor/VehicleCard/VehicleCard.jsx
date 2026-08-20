import Carro from '../../../assets/images/icons/carro.png'
import Moto from '../../../assets/images/icons/moto.png'
import './VehicleCard.css';

// Mapa simples de nomes de cor -> cor visual do "swatch".
// Cobre os casos mais comuns; cores não mapeadas caem no cinza neutro.
const SWATCH_POR_COR = {
    amarelo: '#F2C230',
    azul: '#1F5FBF',
    bege: '#D9C6A5',
    branco: '#FFFFFF',
    bronze: '#8C6239',
    cinza: '#9AA0A6',
    dourado: '#C9A227',
    indefinida: '#B0B4B9',
    laranja: '#E2711D',
    marrom: '#6B4226',
    prata: '#C7C9CC',
    preto: '#1F1F1F',
    rosa: '#E58AA8',
    roxo: '#6B3FA0',
    verde: '#2E7D4F',
    vermelho: '#C0392B',
    vinho: '#5C1A2E',
};

function corDoSwatch(nomeCor) {
    const chave = (nomeCor || '').trim().toLowerCase();
    return SWATCH_POR_COR[chave] || '#8a8f98';
}

export function VehicleCard({ veiculo }) {
    const ehMoto = veiculo.tipo === 'M';
    const temPedalAux = veiculo.pedalAux === 'S';

    return (
        <li className="vehicle-card">
            <div className="vehicle-card__media">
                <img
                    className="vehicle-card__icon"
                    src={ehMoto ? Moto : Carro}
                    alt={ehMoto ? 'Moto' : 'Carro'}
                />
            </div>

            <div className="vehicle-card__content">
                <div className="vehicle-card__header">
                    <div className="vehicle-card__title-wrap">
                        <p className="vehicle-card__title" title={`${veiculo.marca} ${veiculo.modelo}`}>
                            {veiculo.marca} <span className="vehicle-card__model">{veiculo.modelo}</span>
                        </p>
                    </div>
                    <span className="vehicle-card__year">{veiculo.ano}</span>
                </div>

                <div className="vehicle-card__meta">
                    <span className="vehicle-card__meta-item">
                        <span
                            className="vehicle-card__swatch"
                            style={{ background: corDoSwatch(veiculo.cor) }}
                            aria-hidden="true"
                        />
                        {veiculo.cor}
                    </span>
                    <span className="vehicle-card__meta-item">{veiculo.direcao}</span>
                    {veiculo.cilindrada && (
                        <span className="vehicle-card__meta-item">{veiculo.cilindrada}cc</span>
                    )}
                </div>

                <div className="vehicle-card__highlights">
                    <span className="vehicle-card__badge vehicle-card__badge--cambio">
                        {veiculo.cambio}
                    </span>
                    <span
                        className={`vehicle-card__badge ${temPedalAux ? 'vehicle-card__badge--pedal-on' 
                        : 'vehicle-card__badge--pedal-off'}`}
                    >
                        {temPedalAux ? 'Pedal auxiliar' : 'Sem pedal auxiliar'}
                    </span>
                </div>
            </div>
        </li>
    );
}