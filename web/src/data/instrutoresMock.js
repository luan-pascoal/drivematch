/**
 * Dados de exemplo para a vitrine e página do instrutor.
 * Quando a API estiver pronta, troque por uma chamada ao backend.
 */
export const instrutoresMock = [
  {
    id: 1,
    nome: 'Carlos Mendes',
    local: 'São Paulo — Zona Sul',
    horario: 'Seg a Sáb · 7h às 19h',
    categorias: 'Cat. B',
    tags: [{ tipo: 'b', label: 'B' }],
    valorHora: 85,
    foto: 'https://i.pravatar.cc/400?img=12',
    nota: 4.9,
    totalAvaliacoes: 128,
    tempoCadastro: '3 anos',
    aulasDadas: 840,
    sobreMim:
      'Instrutor credenciado com foco em alunos nervosos no trânsito. Trabalho paciência, revisão de manobras e preparação para o exame prático da CNH.',
  },
  {
    id: 2,
    nome: 'Ana Paula Ribeiro',
    local: 'Campinas — Centro',
    horario: 'Ter a Dom · 8h às 18h',
    categorias: 'Cat. A · Cat. B',
    tags: [
      { tipo: 'a', label: 'A' },
      { tipo: 'b', label: 'B' },
    ],
    valorHora: 95,
    foto: 'https://i.pravatar.cc/400?img=5',
    nota: 5.0,
    totalAvaliacoes: 96,
    tempoCadastro: '2 anos',
    aulasDadas: 620,
    sobreMim:
      'Atendo iniciantes em moto e carro. Minhas aulas combinam teoria aplicada, rotas reais e simulação de prova prática com feedback claro após cada treino.',
  },
  {
    id: 3,
    nome: 'Roberto Silva',
    local: 'Guarulhos — Cumbica',
    horario: 'Seg a Sex · 6h às 17h',
    categorias: 'Cat. B',
    tags: [{ tipo: 'b', label: 'B' }],
    valorHora: 78,
    foto: 'https://i.pravatar.cc/400?img=33',
    nota: 4.7,
    totalAvaliacoes: 74,
    tempoCadastro: '1 ano',
    aulasDadas: 410,
    sobreMim:
      'Especialista em veículos automáticos para quem está retomando a prática ou fazendo a primeira habilitação. Horários flexíveis no período da manhã.',
  },
  {
    id: 4,
    nome: 'Fernanda Costa',
    local: 'Santo André — Jardim',
    horario: 'Seg a Sáb · 9h às 20h',
    categorias: 'Cat. A · Cat. B · Cat. AB',
    tags: [
      { tipo: 'a', label: 'A' },
      { tipo: 'b', label: 'B' }
    ],
    valorHora: 110,
    foto: 'https://i.pravatar.cc/400?img=9',
    nota: 4.8,
    totalAvaliacoes: 201,
    tempoCadastro: '4 anos',
    aulasDadas: 1200,
    sobreMim:
      'Profissional com experiência em todas as categorias. Ajudo o aluno a ganhar confiança no volante, com plano de aulas personalizado conforme o objetivo.',
  },
  {
    id: 5,
    nome: 'Marcos Oliveira',
    local: 'Osasco — Presidente Altino',
    horario: 'Qua a Dom · 7h às 16h',
    categorias: 'Cat. B',
    tags: [{ tipo: 'b', label: 'B' }],
    valorHora: 72,
    foto: 'https://i.pravatar.cc/400?img=15',
    nota: 4.6,
    totalAvaliacoes: 58,
    tempoCadastro: '8 meses',
    aulasDadas: 290,
    sobreMim:
      'Valorizo aulas objetivas e bem explicadas. Trabalho baliza, conversões e direção defensiva com rotas variadas na região de Osasco.',
  },
  {
    id: 6,
    nome: 'Juliana Martins',
    local: 'São Bernardo — Rudge Ramos',
    horario: 'Seg a Sex · 8h às 18h',
    categorias: 'Cat. B',
    tags: [{ tipo: 'b', label: 'B' }],
    valorHora: 88,
    foto: 'https://i.pravatar.cc/400?img=20',
    nota: 4.9,
    totalAvaliacoes: 112,
    tempoCadastro: '2 anos',
    aulasDadas: 530,
    sobreMim:
      'Atendo alunos que preferem um ritmo calmo e acolhedor. Reforço pontos de atenção da prova prática e organizo revisões antes do exame.',
  },
];

export function buscarInstrutorPorId(id) {
  const idNumero = Number(id);
  return instrutoresMock.find((item) => item.id === idNumero) ?? null;
}
