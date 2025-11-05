# PDM – App de Gestão de Alunos para Personais Trainers

## Sobre o projeto

Este é um aplicativo mobile em desenvolvimento cuja proposta é ajudar personais trainers a gerenciar seus alunos de forma simples e organizada. A ideia é centralizar o dia a dia do personal: visualizar aulas do dia/amanhã, acompanhar aniversariantes do mês, navegar pela lista de alunos e gerenciar o perfil.

Funcionalidades atuais (MVP):

- Autenticação com Firebase (login, cadastro, recuperação de senha)
- Dashboard com cards de: aulas de hoje/amanhã e aniversariantes do mês
- Lista de Alunos com avatares e menu de opções (editar/excluir – placeholders)
- Tela de Perfil (visualização e edição básicas)
- Tela “Proposta” acessível via Perfil (oculta da barra de abas)
- UX refinada: modal de boas‑vindas com blur após login, design system consistente, navegação por abas

Tecnologias principais:

- Expo SDK 54, React Native 0.81, TypeScript
- Expo Router (navegação baseada em arquivos)
- Firebase (Auth e Firestore)
- react-native-safe-area-context, react-native-reanimated, react-native-gesture-handler
- expo-blur, @expo/vector-icons

## Autor

Sou Vitor Fregulia, estudante do 5° semestre do curso de Tecnologia em Sistemas para Internet no IFSul Campus – Pelotas.

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o app (Android/iOS/Web via Expo):

   ```bash
   npx expo start
   ```

Com o comando acima você pode abrir no emulador/simulador ou no dispositivo físico via QR Code.

## Estrutura (resumo)

- `app/` – rotas e navegação (Expo Router)
- `screens/` – telas (Home, Students, Profile, Auth)
- `components/` – componentes compartilhados (ThemedButton, UserAvatar, etc.)
- `context/` – AuthContext (estado de autenticação, integração Firebase)
- `services/` – inicialização do Firebase
- `constants/` – tema e estilos globais
- `utils/` – dados mock para desenvolvimento

## Próximos passos (ideias)

- CRUD real de alunos integrado ao Firestore
- Agenda detalhada por aluno e histórico de treinos
- Filtros e buscas na lista de alunos
- Notificações e lembretes
