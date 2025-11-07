# Debug de Permissões - Conta Trainer

## Problema

Quando o trainer tenta abrir as páginas de alunos e academia, aparece erro "Missing or insufficient permissions".

## Logs Adicionados

Foram adicionados logs detalhados em:

### 1. `services/trainers.ts` - `getTrainerContext()`

Mostra:

- UID do trainer atual
- Tentativa de buscar via collectionGroup teachers
- Quantos documentos foram encontrados
- Dados do documento teacher encontrado
- Tentativas de fallback via invites e perfil /users
- Retorno final (ownerUid e gymId)

### 2. `app/screens/Trainer/DashboardTrainerScreen.tsx`

Mostra:

- Início do carregamento
- Contexto recuperado (gymId e ownerId)
- Tentativa de carregar academia
- Tentativa de contar alunos
- Tentativa de contar turmas
- Tentativa de listar alunos
- **Cada operação em try/catch separado** para identificar qual está falhando

### 3. `app/screens/Trainer/AcademyViewScreen.tsx`

Mostra:

- Início do carregamento
- Contexto recuperado
- Carregamento da academia

## Como Debugar

1. **Abra o terminal do Metro Bundler** (onde você rodou `npx expo start`)

2. **Faça login com uma conta trainer** no app

3. **Tente acessar**:

   - Tela de Dashboard (trainer)
   - Tela de Academia (trainer)
   - Tela de Alunos (trainer, se houver)

4. **Observe os logs no terminal**. Você verá mensagens como:

   ```
   [getTrainerContext] UID: abc123...
   [getTrainerContext] Tentando collectionGroup teachers...
   [getTrainerContext] Documentos encontrados no collectionGroup: 0
   [getTrainerContext] Tentando fallback via invites...
   ...
   [DashboardTrainer] Erro ao contar alunos: FirebaseError: Missing or insufficient permissions
   ```

5. **Identifique qual operação está falhando**:
   - Se falhar em `getAcademyById`: problema em ler `/academies/{gymId}`
   - Se falhar em `getCountFromServer(students)`: problema em ler `/academies/{gymId}/students`
   - Se falhar em `getCountFromServer(classes)`: problema em ler `/academies/{gymId}/classes`
   - Se `getTrainerContext` retornar null: trainer não está vinculado corretamente

## Análise Inicial

### Regras do Firestore Atuais

No arquivo `firestore.rules`, temos:

```plaintext
match /academies/{gymId} {
  // Qualquer usuário autenticado pode ler
  allow read: if request.auth != null;
  ...

  // Subcoleção TEACHERS
  match /teachers/{tid} {
    allow read: if request.auth != null;
    ...
  }

  // Outras subcoleções (students, classes, etc.)
  match /{document=**} {
    allow read: if request.auth != null;
    allow write, update, delete: if isOwner(gymId);
  }
}
```

### Possíveis Problemas

1. **gymId pode estar null ou incorreto**: Se `getTrainerContext` não encontrar o vínculo
2. **Subcoleções students/classes não existem**: Se o owner ainda não criou alunos
3. **Índices do Firestore**: Firestore pode precisar de índices para queries com `where` + `orderBy`

## Próximos Passos

Depois de ver os logs:

### Se gymId for null:

- Verificar se o trainer foi criado corretamente via invite
- Verificar se o documento em `/academies/{gymId}/teachers/{uid}` existe
- Verificar se o perfil em `/users/{uid}` tem `owner_id` e `gym_id`

### Se gymId estiver correto mas ainda der erro:

- Verificar no console do Firebase se o documento `/academies/{gymId}` existe
- Verificar se as subcoleções `/academies/{gymId}/students` e `/academies/{gymId}/classes` existem
- Verificar se há algum índice faltando (Firestore mostrará link para criar)

### Se precisar criar dados de teste:

- Logar como owner
- Criar alguns alunos (quando essa funcionalidade estiver pronta)
- Depois testar novamente como trainer

## Contato

Se mesmo com os logs não ficar claro, envie:

1. Os logs completos do terminal
2. Screenshot do erro na tela
3. UID do trainer que está testando
