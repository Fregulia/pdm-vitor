# PDM - Personal Digital Manager

> Sistema de gestão para academias com foco em personal trainers, alunos e proprietários

## 📋 Sobre o Projeto

PDM é um aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso que permite a gestão completa de academias, conectando proprietários, personal trainers e alunos em uma única plataforma integrada.

**Autor:** Vitor Fregulia  
**Instituição:** IFSul Campus Pelotas - Tecnologia em Sistemas para Internet (5° Semestre)

## 🎯 Funcionalidades Principais

### 👔 Owner (Proprietário da Academia)

- Configuração completa da academia (nome, endereço, contato, horários)
- Geração de convites para professores e alunos
- Dashboard com estatísticas (professores, alunos, turmas)
- Gerenciamento de turmas e horários
- Visualização de professores e alunos cadastrados
- Sistema de planos de treino
- **💰 Gestão de pagamentos e cobranças**
- **📊 Relatórios financeiros**

### 🏋️ Trainer (Personal/Professor)

- Cadastro via convite do proprietário
- Dashboard personalizado com próxima aula
- Visualização de alunos atribuídos
- Gerenciamento de turmas responsáveis
- Criação e edição de planos de treino
- Biblioteca de 36+ exercícios padrão
- Atribuição de treinos para alunos
- **💬 Sistema de mensagens com alunos**
- **💰 Controle de pagamentos recebidos**

### 🎓 Student (Aluno)

- Cadastro via convite específico (vinculado a um trainer)
- Visualização de planos de treino atribuídos
- Informações da academia e professor responsável
- Dashboard com estatísticas pessoais
- Acesso a turmas matriculadas
- **💬 Chat direto com personal trainer**
- **💰 Visualização de mensalidades e pagamentos**

## 🛠️ Tecnologias Utilizadas

### Core

- **Expo SDK 54** - Framework React Native
- **React Native 0.81** - Framework mobile
- **TypeScript** - Tipagem estática
- **Expo Router 6** - Navegação baseada em arquivos

### Firebase

- **Firebase Authentication** - Autenticação de usuários
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de imagens
- **Real-time Subscriptions** - Atualizações em tempo real

### UI/UX

- **React Navigation** - Navegação (Drawer + Bottom Tabs)
- **Expo Blur** - Efeitos visuais
- **@expo/vector-icons** - Ícones
- **react-native-reanimated** - Animações
- **react-native-gesture-handler** - Gestos
- **react-native-safe-area-context** - Safe areas

### Recursos Adicionais

- **Expo Image Picker** - Seleção de fotos
- **Expo Secure Store** - Armazenamento seguro (credenciais)
- **@react-native-community/datetimepicker** - Seletor de horários
- **Custom Firestore Hooks** - Hooks para real-time data (useCollection, useDoc)
- **Advanced Error Handling** - Sistema de tratamento de erros Firebase
- **Non-blocking Updates** - Operações assíncronas otimizadas

## 📁 Estrutura do Projeto

```
TCC/
├── app/                          # Rotas (Expo Router)
│   ├── (owner)/                  # Grupo de rotas do proprietário
│   │   ├── (drawer)/            # Navegação drawer
│   │   │   ├── dashboard.tsx
│   │   │   ├── teachers.tsx
│   │   │   ├── students.tsx
│   │   │   ├── classes.tsx
│   │   │   ├── academy.tsx
│   │   │   └── profile.tsx
│   │   ├── setup.tsx            # Configuração inicial
│   │   └── plans-setup.tsx      # Configuração de planos
│   ├── (trainer)/               # Grupo de rotas do professor
│   │   └── (tabs)/
│   │       ├── dashboard.tsx
│   │       ├── students.tsx
│   │       ├── workouts.tsx
│   │       ├── academy.tsx
│   │       └── profile.tsx
│   ├── (student)/               # Grupo de rotas do aluno
│   │   └── (tabs)/
│   │       ├── dashboard.tsx
│   │       ├── chat.tsx
│   │       └── profile.tsx
│   ├── auth/                    # Autenticação
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   ├── signup-choose.tsx
│   │   ├── signup-student.tsx
│   │   ├── forgot-password.tsx
│   │   └── confirm-email.tsx
│   ├── preload.tsx              # Tela de carregamento inicial
│   └── _layout.tsx              # Layout raiz
├── screens/                     # Componentes de tela
│   ├── Auth/
│   ├── Owner/
│   ├── Trainer/
│   ├── Student/
│   ├── Profile/
│   ├── Messages/               # 💬 Sistema de mensagens
│   │   └── MessagesScreen.tsx
│   └── Payments/               # 💰 Sistema de pagamentos
│       └── PaymentsScreen.tsx
├── components/                  # Componentes reutilizáveis
│   ├── ThemedButton.tsx
│   ├── ThemedInput.tsx
│   ├── UserAvatar.tsx
│   ├── TimeInput.tsx
│   ├── BackButton.tsx
│   ├── MenuButton.tsx
│   ├── CustomDrawer.tsx
│   └── FirebaseErrorListener.tsx  # 🔧 Listener de erros global
├── services/                    # Lógica de negócio
│   ├── firebase.ts             # Inicialização Firebase
│   ├── academy.ts              # Gerenciamento de academias
│   ├── trainers.ts             # Gerenciamento de professores
│   ├── students.ts             # Gerenciamento de alunos
│   ├── classes.ts              # Gerenciamento de turmas
│   ├── workouts.ts             # Gerenciamento de treinos
│   ├── exercises.ts            # Biblioteca de exercícios
│   ├── invites.ts              # Sistema de convites (trainers)
│   ├── studentInvites.ts       # Sistema de convites (alunos)
│   ├── users.ts                # Perfis de usuário
│   ├── storage.ts              # Upload de imagens
│   ├── messages.ts             # 💬 Serviço de mensagens
│   └── payments.ts             # 💰 Serviço de pagamentos
├── hooks/
│   └── firestore/              # 🎣 Custom Firestore Hooks
│       ├── useCollection.ts    # Hook para coleções em tempo real
│       ├── useDoc.ts           # Hook para documentos em tempo real
│       └── index.ts
├── context/
│   └── AuthContext.tsx         # Contexto de autenticação
├── constants/
│   ├── theme.ts                # Cores e fontes
│   ├── styles.ts               # Estilos globais
│   └── firebase.ts             # Configuração Firebase
├── utils/
│   ├── mock-data.ts            # Dados de desenvolvimento
│   └── firebase/               # 🔧 Utilitários Firebase
│       ├── error-emitter.ts    # Sistema de eventos de erro
│       ├── errors.ts           # Classes de erro customizadas
│       ├── non-blocking-updates.ts  # Operações não bloqueantes
│       └── index.ts
├── .env                        # Variáveis de ambiente
├── firestore.rules             # Regras de segurança Firestore
└── app.json                    # Configuração Expo
```

## 🗄️ Estrutura do Firestore

```
firestore/
├── users/{uid}                          # Perfis de usuário
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── role: "owner" | "trainer" | "student"
│   ├── photoUrl?: string
│   ├── owner_id?: string
│   ├── gym_id?: string
│   └── trainer_id?: string (apenas students)
│
├── academies/{gymId}                    # Academias
│   ├── id: string (gymId)
│   ├── ownerUid: string
│   ├── name: string
│   ├── address: string
│   ├── contact: string
│   ├── hours: {
│   │   weekdays: { open, close }
│   │   saturday: { open, close }
│   │   sunday: { open, close }
│   │ }
│   │
│   ├── /teachers/{trainerId}            # Professores
│   │   ├── uid: string
│   │   ├── name: string
│   │   ├── bio: string
│   │   ├── cref: string
│   │   ├── owner_id: string
│   │   └── gym_id: string
│   │
│   ├── /students/{studentId}            # Alunos
│   │   ├── uid: string
│   │   ├── name: string
│   │   ├── email: string
│   │   ├── owner_id: string
│   │   ├── gym_id: string
│   │   └── trainer_id: string
│   │
│   ├── /classes/{classId}               # Turmas
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── trainerId: string
│   │   ├── dayOfWeek: string
│   │   ├── startTime: string (HH:MM)
│   │   ├── endTime: string (HH:MM)
│   │   └── students: string[]
│   │
│   ├── /exercises/{exerciseId}          # Exercícios
│   │   ├── name: string
│   │   ├── category: string
│   │   ├── muscleGroup: string
│   │   ├── equipment: string
│   │   ├── difficulty: string
│   │   └── isDefault: boolean
│   │
│   ├── /workouts/{workoutId}            # Planos de treino
│   │   ├── trainerId: string
│   │   ├── name: string
│   │   ├── description: string
│   │   └── exercises: [{
│   │       exerciseId, exerciseName,
│   │       sets, reps, rest, notes
│   │     }]
│   │
│   └── /workout_assignments/{assignmentId}  # Atribuições
│       ├── workoutId: string
│       ├── studentId: string
│       ├── classId: string
│       └── assignedAt: timestamp
│
├── conversations/{conversationId}       # 💬 Conversas (NOVO)
│   ├── participants: string[]
│   ├── lastMessage: string
│   ├── lastMessageTime: timestamp
│   ├── unreadCount: { [userId]: number }
│   └── /messages/{messageId}
│       ├── senderId: string
│       ├── receiverId: string
│       ├── text: string
│       ├── timestamp: timestamp
│       └── read: boolean
│
├── payments/{paymentId}                 # 💰 Pagamentos (NOVO)
│   ├── studentId: string
│   ├── trainerId: string
│   ├── academyId: string
│   ├── amount: number
│   ├── status: 'paid' | 'pending' | 'overdue'
│   ├── dueDate: timestamp
│   ├── paidDate?: timestamp
│   ├── description: string
│   └── createdAt: timestamp
│
├── subscriptions/{subscriptionId}       # 💰 Assinaturas (NOVO)
│   ├── studentId: string
│   ├── planId: string
│   ├── amount: number
│   ├── status: 'active' | 'cancelled' | 'suspended'
│   ├── startDate: timestamp
│   ├── nextBillingDate: timestamp
│   └── autoRenew: boolean
│
├── invites/{code}                       # Convites para trainers
│   ├── code: string
│   ├── ownerUid: string
│   ├── gymId: string
│   ├── usedBy?: string
│   ├── usedAt?: timestamp
│   └── expiresAt?: timestamp
│
└── studentInvites/{code}                # Convites para alunos
    ├── code: string
    ├── ownerUid: string
    ├── gymId: string
    ├── trainerId: string
    ├── studentName: string
    ├── usedBy?: string
    └── usedAt?: timestamp
```

## 📋 Requisitos do Sistema

### Requisitos Funcionais

#### RF01 - Autenticação e Autorização

- **RF01.1**: Sistema deve permitir cadastro de usuários com email e senha
- **RF01.2**: Sistema deve autenticar usuários via Firebase Authentication
- **RF01.3**: Sistema deve diferenciar três tipos de usuário (Owner, Trainer, Student)
- **RF01.4**: Sistema deve permitir recuperação de senha via email
- **RF01.5**: Sistema deve manter sessão do usuário ("lembrar-me")

#### RF02 - Gestão de Academia (Owner)

- **RF02.1**: Owner deve configurar dados da academia (nome, endereço, contato, horários)
- **RF02.2**: Owner deve gerar convites únicos para professores
- **RF02.3**: Owner deve gerar convites únicos para alunos (vinculados a um trainer)
- **RF02.4**: Owner deve visualizar estatísticas (total de professores, alunos, turmas)
- **RF02.5**: Owner deve criar, editar e excluir turmas
- **RF02.6**: Owner deve visualizar lista de professores e alunos cadastrados
- **RF02.7**: Owner deve atribuir professores responsáveis às turmas

#### RF03 - Gestão de Treinos (Trainer)

- **RF03.1**: Trainer deve cadastrar-se via convite do owner
- **RF03.2**: Trainer deve visualizar alunos atribuídos a ele
- **RF03.3**: Trainer deve criar planos de treino personalizados
- **RF03.4**: Trainer deve editar e excluir seus próprios planos de treino
- **RF03.5**: Trainer deve atribuir planos de treino para alunos
- **RF03.6**: Trainer deve acessar biblioteca de exercícios (36+ padrão)
- **RF03.7**: Trainer deve visualizar turmas sob sua responsabilidade
- **RF03.8**: Trainer deve visualizar próxima aula no dashboard

#### RF04 - Acompanhamento (Student)

- **RF04.1**: Student deve cadastrar-se via convite específico
- **RF04.2**: Student deve visualizar planos de treino atribuídos
- **RF04.3**: Student deve visualizar informações da academia
- **RF04.4**: Student deve visualizar dados do professor responsável
- **RF04.5**: Student deve acessar turmas matriculadas

#### RF05 - Gestão de Exercícios

- **RF05.1**: Sistema deve fornecer biblioteca com 36 exercícios padrão
- **RF05.2**: Sistema deve categorizar exercícios (grupo muscular, equipamento, dificuldade)
- **RF05.3**: Trainers devem poder criar exercícios personalizados
- **RF05.4**: Exercícios devem conter: nome, categoria, grupo muscular, equipamento, dificuldade

#### RF06 - Gestão de Turmas

- **RF06.1**: Sistema deve permitir criação de turmas com horário e dia da semana
- **RF06.2**: Sistema deve validar conflitos de horário
- **RF06.3**: Sistema deve permitir atribuição de alunos às turmas
- **RF06.4**: Sistema deve exibir lista de alunos por turma

#### RF07 - Perfil de Usuário

- **RF07.1**: Usuários devem poder editar seus dados pessoais
- **RF07.2**: Usuários devem poder fazer upload de foto de perfil
- **RF07.3**: Sistema deve exibir avatar com iniciais quando não houver foto

### Requisitos Não Funcionais

#### RNF01 - Performance

- **RNF01.1**: Tempo de carregamento inicial não deve exceder 3 segundos
- **RNF01.2**: Transições entre telas devem ser fluidas (60fps)
- **RNF01.3**: Consultas ao Firestore devem usar cache quando possível
- **RNF01.4**: Imagens devem ser otimizadas antes do upload

#### RNF02 - Segurança

- **RNF02.1**: Senhas devem ser gerenciadas exclusivamente pelo Firebase Auth
- **RNF02.2**: Credenciais locais devem usar Expo Secure Store
- **RNF02.3**: Firestore Rules devem validar permissões no backend
- **RNF02.4**: Convites devem ser de uso único e não reutilizáveis
- **RNF02.5**: Dados sensíveis não devem ser expostos em logs

#### RNF03 - Usabilidade

- **RNF03.1**: Interface deve seguir guidelines de Material Design
- **RNF03.2**: Sistema deve suportar tema claro e escuro
- **RNF03.3**: Navegação deve ser intuitiva e consistente
- **RNF03.4**: Feedback visual deve ser fornecido para todas as ações
- **RNF03.5**: Mensagens de erro devem ser claras e orientativas

#### RNF04 - Compatibilidade

- **RNF04.1**: Aplicativo deve funcionar em Android 8.0+
- **RNF04.2**: Aplicativo deve funcionar em iOS 13.0+
- **RNF04.3**: Interface deve ser responsiva para diferentes tamanhos de tela
- **RNF04.4**: Sistema deve respeitar Safe Areas de dispositivos

#### RNF05 - Manutenibilidade

- **RNF05.1**: Código deve seguir padrões TypeScript strict
- **RNF05.2**: Componentes devem ser reutilizáveis e modulares
- **RNF05.3**: Serviços devem ter responsabilidade única
- **RNF05.4**: Código deve ser documentado com comentários quando necessário

#### RNF06 - Escalabilidade

- **RNF06.1**: Estrutura do Firestore deve suportar múltiplas academias
- **RNF06.2**: Sistema deve suportar crescimento de usuários sem degradação
- **RNF06.3**: Queries devem usar índices apropriados
- **RNF06.4**: Subcoleções devem ser usadas para evitar documentos grandes

#### RNF07 - Disponibilidade

- **RNF07.1**: Sistema deve funcionar com conexão intermitente (cache)
- **RNF07.2**: Erros de rede devem ser tratados graciosamente
- **RNF07.3**: Sistema deve ter fallbacks para dados não disponíveis

#### RNF08 - Confiabilidade

- **RNF08.1**: Dados devem ser persistidos com timestamps
- **RNF08.2**: Operações críticas devem ter validação dupla (client + server)
- **RNF08.3**: Sistema deve prevenir perda de dados em operações assíncronas

## 🔐 Sistema de Autenticação

### Fluxo de Login

1. Usuário insere email e senha
2. Firebase Authentication valida credenciais
3. Sistema busca perfil em `/users/{uid}`
4. Redireciona baseado no `role`:
   - `owner` → Verifica setup da academia → Dashboard Owner
   - `trainer` → Dashboard Trainer
   - `student` → Dashboard Student

### Fluxo de Cadastro

#### Owner (Proprietário)

1. Cadastro normal com email/senha
2. Cria documento em `/users/{uid}` com `role: "owner"`
3. Redireciona para setup da academia
4. Preenche dados da academia
5. Academia criada em `/academies/{gymId}`

#### Trainer (Professor)

1. Owner gera convite em `/invites/{code}`
2. Trainer acessa link/código do convite
3. Cadastra-se com email/senha
4. Preenche dados (nome, bio, CREF)
5. Sistema consome convite e cria:
   - Documento em `/users/{uid}` com `role: "trainer"`
   - Documento em `/academies/{gymId}/teachers/{uid}`

#### Student (Aluno)

1. Owner gera convite em `/studentInvites/{code}` (vinculado a um trainer)
2. Aluno acessa link/código do convite
3. Cadastra-se com email/senha
4. Sistema consome convite e cria:
   - Documento em `/users/{uid}` com `role: "student"`
   - Documento em `/academies/{gymId}/students/{uid}`

## 🎨 Design System

### Cores

```typescript
light: {
  text: "#212529";
  background: "#F0F4F8";
  tint: "#007BFF";
  card: "#FFFFFF";
  border: "#DDE2E5";
  secondaryText: "#555";
}

dark: {
  text: "#EAEAEA";
  background: "#121212";
  tint: "#009cff";
  card: "#1E1E1E";
  border: "#272727";
  secondaryText: "#bbb";
}
```

### Componentes Principais

- **ThemedButton**: Botão com tema automático
- **ThemedInput**: Input com validação e tema
- **UserAvatar**: Avatar com iniciais ou foto
- **TimeInput**: Seletor de horário
- **ScreenLayout**: Layout padrão com safe area

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta Firebase configurada

### Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd TCC
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz com as credenciais do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Configure as regras do Firestore:

```bash
npm run firebase:deploy:rules
```

5. Inicie o aplicativo:

```bash
npm start
# ou
npx expo start
```

6. Execute no dispositivo:

- **Android**: Pressione `a` ou escaneie o QR Code com Expo Go
- **iOS**: Pressione `i` ou escaneie o QR Code com Expo Go
- **Web**: Pressione `w`

## 📱 Navegação

### Owner

```
(owner)/
  └── (drawer)/
      ├── dashboard      # Estatísticas gerais
      ├── teachers       # Gerenciar professores
      ├── students       # Gerenciar alunos
      ├── classes        # Gerenciar turmas
      ├── academy        # Configurar academia
      └── profile        # Perfil do usuário
```

### Trainer

```
(trainer)/
  └── (tabs)/
      ├── dashboard      # Próxima aula e estatísticas
      ├── students       # Lista de alunos
      ├── workouts       # Planos de treino
      ├── academy        # Info da academia
      └── profile        # Perfil do usuário
```

### Student

```
(student)/
  └── (tabs)/
      ├── dashboard      # Treinos e informações
      ├── chat           # Chat com trainer (futuro)
      └── profile        # Perfil do usuário
```

## 🔒 Segurança

### Firestore Rules

- Usuários só podem editar seu próprio perfil
- Owners têm controle total sobre sua academia
- Trainers podem criar/editar seus próprios treinos
- Students só podem ler seus próprios dados
- Convites são de uso único e validados

### Boas Práticas

- Senhas nunca são armazenadas (Firebase Auth)
- Tokens de sessão gerenciados pelo Firebase
- Credenciais salvas com Expo Secure Store
- Validação de permissões no backend (Firestore Rules)

## 📊 Funcionalidades Implementadas

✅ Sistema completo de autenticação (login, cadastro, recuperação)  
✅ Três perfis de usuário (Owner, Trainer, Student)  
✅ Sistema de convites com códigos únicos  
✅ Configuração completa de academia  
✅ CRUD de turmas com validação de horários  
✅ Biblioteca de 36 exercícios padrão  
✅ Criação de planos de treino personalizados  
✅ Atribuição de treinos para alunos  
✅ Dashboard personalizado por perfil  
✅ Upload de fotos de perfil  
✅ Tema claro/escuro automático  
✅ Navegação responsiva (Drawer + Tabs)

## 🚧 Roadmap

### Próximas Funcionalidades

- [ ] Chat entre trainer e aluno
- [ ] Histórico de treinos realizados
- [ ] Sistema de check-in em aulas
- [ ] Notificações push
- [ ] Relatórios e gráficos de progresso
- [ ] Filtros e busca avançada
- [ ] Exportação de dados (PDF)
- [ ] Integração com wearables
- [x] **Sistema de pagamentos** ✅
- [x] **Sistema de mensagens** ✅
- [ ] Agendamento de aulas particulares
- [ ] Sistema de AI para sugestões de treino

### Melhorias Técnicas

- [ ] Testes unitários e E2E
- [ ] CI/CD pipeline
- [ ] Otimização de performance
- [ ] Offline-first com sincronização
- [ ] Internacionalização (i18n)
- [ ] Acessibilidade (a11y)
- [x] **Custom Firestore Hooks** ✅
- [x] **Advanced Error Handling** ✅

## ✨ Novas Funcionalidades (Dezembro 2024)

### 💬 Sistema de Mensagens

Sistema completo de chat em tempo real entre trainers e alunos.

**Características:**

- Chat individual em tempo real
- Indicadores de mensagens não lidas
- Histórico de conversas
- Interface responsiva com KeyboardAvoidingView
- Sincronização automática via Firestore

**Arquivos principais:**

- `services/messages.ts` - Lógica de negócio
- `screens/Messages/MessagesScreen.tsx` - Interface
- Coleção Firestore: `conversations/{conversationId}/messages`

### 💰 Sistema de Pagamentos

Gerenciamento completo de cobranças e assinaturas.

**Características:**

- Registro de pagamentos (pago, pendente, atrasado)
- Assinaturas mensais automáticas
- Alertas de pagamentos vencidos
- Filtros por status
- Dashboard de pagamentos para cada role

**Arquivos principais:**

- `services/payments.ts` - Lógica de negócio
- `screens/Payments/PaymentsScreen.tsx` - Interface
- Coleções Firestore: `payments`, `subscriptions`

### 🎣 Custom Firestore Hooks

Hooks React para simplificar operações com Firestore.

**useCollection:**

```typescript
const { data, isLoading, error } = useCollection(myQuery);
```

**useDoc:**

```typescript
const { data, isLoading, error } = useDoc(myDocRef);
```

**Características:**

- Real-time subscriptions
- Gestão automática de loading/error states
- Unsubscribe automático
- Tipagem forte com TypeScript

**Arquivos:**

- `hooks/firestore/useCollection.ts`
- `hooks/firestore/useDoc.ts`

### 🔧 Sistema Avançado de Tratamento de Erros

Sistema robusto para captura e tratamento de erros Firebase.

**Componentes:**

- **Error Emitter**: Pub/sub pattern para propagação de erros
- **FirestorePermissionError**: Classe de erro customizada com contexto detalhado
- **Non-blocking Updates**: Operações assíncronas que não bloqueiam a UI
- **FirebaseErrorListener**: Componente global para captura de erros

**Características:**

- Mensagens de erro detalhadas com contexto completo
- Debugging facilitado de security rules
- Informações de autenticação e path do documento
- Propagação global de erros

**Arquivos:**

- `utils/firebase/error-emitter.ts`
- `utils/firebase/errors.ts`
- `utils/firebase/non-blocking-updates.ts`
- `components/FirebaseErrorListener.tsx`

**Documentação completa:** Veja [NOVAS_FUNCIONALIDADES.md](./NOVAS_FUNCIONALIDADES.md)

## 🐛 Problemas Conhecidos

- Verificação de email temporariamente desabilitada para testes
- CollectionGroup queries podem falhar em alguns cenários de permissão
- Migração automática de exercícios pode demorar no primeiro acesso

## 📝 Scripts Disponíveis

```bash
npm start              # Inicia o Expo Dev Server
npm run android        # Executa no Android
npm run ios            # Executa no iOS
npm run web            # Executa no navegador
npm run lint           # Executa o linter
npm run firebase:login # Login no Firebase CLI
npm run firebase:deploy:rules # Deploy das regras do Firestore
```

## 🤝 Contribuindo

Este é um projeto acadêmico, mas sugestões são bem-vindas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso e está disponível para fins educacionais.

## 👨‍💻 Autor

**Vitor Fregulia**  
Estudante de Tecnologia em Sistemas para Internet  
IFSul Campus Pelotas - 5° Semestre

---

**Desenvolvido com ❤️ usando Expo + Firebase**
