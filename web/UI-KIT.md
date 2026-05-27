# UI Kit (padrão do front)

Este projeto tem um “mini bootstrap” próprio, com estilos globais simples e reutilizáveis.

## Onde ficam os estilos

- `src/styles/tokens.css`: cores, fontes, espaçamentos, sombras (variáveis CSS).
- `src/styles/base.css`: reset + acessibilidade + estilos base.
- `src/styles/layout.css`: estrutura do layout (header, main, footer, container).
- `src/styles/components.css`: componentes (botão, card, input, alert, badge).
- `src/styles/utilities.css`: utilitários (stack, row, muted, etc.).

Eles são carregados pelo `src/index.css`.

## Como usar o layout padrão (import)

Use o componente `AppLayout`:

```jsx
import { AppLayout } from '../components/layout/AppLayout';

export function MinhaPagina() {
  return (
    <AppLayout headerRight={<button className="btn btn--primary">Ação</button>}>
      <div className="card">
        <div className="card__header">
          <h1 className="card__title">Título</h1>
          <p className="card__subtitle">Subtítulo</p>
        </div>
        <div className="card__body">Conteúdo</div>
      </div>
    </AppLayout>
  );
}
```

## Classes principais (referência rápida)

- Botões: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`
- Card: `.card`, `.card__header`, `.card__title`, `.card__subtitle`, `.card__body`, `.card__footer`
- Campo: `.field`, `.label`, `.input`, `.hint`
- Feedback: `.alert`, `.alert--success`, `.alert--warning`, `.alert--danger`
- Layout: `.container`, `.app-shell`, `.app-header`, `.app-main`, `.app-footer`
- Utilitários: `.stack`, `.row`, `.row--between`, `.muted`, `.sr-only`
