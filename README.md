# PDM - Personal Digital Manager

> Sistema de gestão para academias com foco em personal trainers, alunos e proprietários.

**PDM** é um aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso (TCC) que conecta proprietários de academias, personal trainers e alunos em uma única plataforma integrada.

## 🚀 Funcionalidades Principais

### 🏛️ Owner (Proprietário)
*   **Gestão de Academia**: Configuração completa (horários, local, contato).
*   **Dashboard**: Estatísticas de professores, alunos e financeiro.
*   **Controle**: Gestão de turmas, pagamentos e cobranças.
*   **Convites**: Geração de convites para novos professores e alunos.

### 🏋️ Trainer (Personal)
*   **Treinos**: Criação e atribuição de planos de treino personalizados.
*   **Alunos**: Acompanhamento de progresso e turmas.
*   **Comunicação**: Chat direto com alunos.
*   **Financeiro**: Controle de pagamentos recebidos.

### 🎓 Student (Aluno)
*   **Meu Treino**: Visualização clara dos planos de exercícios.
*   **Comunicação**: Chat direto com o personal trainer.
*   **Financeiro**: Visualização de mensalidades e status de pagamentos.

## 🛠️ Stack Tecnológico

*   **Core**: [React Native](https://reactnative.dev/) (Expo SDK 54), TypeScript.
*   **Navegação**: Expo Router & React Navigation.
*   **Backend (Firebase)**: Authentication, Cloud Firestore (NoSQL), Storage.
*   **UI/UX**: Reanimated, Gesture Handler, Expo Blur.

## 📦 Como Executar

1.  **Instalação**:
    ```bash
    npm install
    ```

2.  **Configuração de Ambiente**:
    Crie um arquivo `.env` na raiz com as credenciais do seu projeto Firebase:
    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=...
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
    # ... outras variáveis do Firebase
    ```

3.  **Execução**:
    ```bash
    npx expo start
    ```

## 📂 Estrutura do Projeto

*   **`app/`**: Rotas e telas da aplicação (estrutura baseada em arquivos).
    *   `(owner)`, `(trainer)`, `(student)`: Rotas específicas de cada perfil.
*   **`services/`**: Lógica de negócios e chamadas ao Firebase.
*   **`components/`**: Componentes de UI reutilizáveis.
*   **`hooks/`**: Custom hooks (ex: `useCollection`, `useDoc` para Firestore).
*   **`types/`**: Definições de tipos TypeScript.

---

**Autor:** Vitor Fregulia  
**Instituição:** IFSul Campus Pelotas - Tecnologia em Sistemas para Internet
