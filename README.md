# Desafio técnico

## Contexto

Desenvolvimento de uma API em Node.js, Express, TypeScript e Prisma para gerenciamento de tickets de atendimento. A aplicação permite o gerenciamento de usuários, de tickets e classifica automaticamente o conteúdo de cada solicitação em um canal e uma prioridade.

A classificação principal é realizada por uma lógica baseada em pontuação e confiança utilizando um dicionário de palavras-chave. Quando o resultado é inconclusivo, a aplicação consulta a API Google Gemini. Caso a IA esteja indisponível, não haja uma chave configurada ou o limite de requisições da API seja atingido, o ticket ainda é criado utilizando a classificação local e permanece marcado para revisão manual.

---

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Docker
- Jest
- Google Gemini API

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY="sua-chave-gemini"
```

A variável abaixo é utilizada pela aplicação:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | Não | Chave da API Google Gemini utilizada para classificar tickets inconclusivos. |

> A chave da API Gemini é opcional. Caso ela não seja informada, esteja inválida ou o limite de requisições seja atingido, a aplicação continuará funcionando utilizando apenas a classificação local. Uma importante consideração é que o uso nesse caso pode ser limitado.

---

## Executar com Docker Compose

A configuração de conexão com o PostgreSQL é fornecida automaticamente pelo `docker-compose.yml`. Não é necessário configurar `DATABASE_URL`.

1. (Opcional) Crie o arquivo `.env` com a variável `GEMINI_API_KEY`.

2. Inicie os containers:

```bash
docker compose up --build
```

3. A API estará disponível em:

```
http://localhost:3000
```

Para interromper os containers:

```bash
docker compose down
```

---

## Executar manualmente

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` contendo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db?schema=public"
GEMINI_API_KEY="sua-chave-gemini"
```

3. Gere o Prisma Client e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Inicie a aplicação:

```bash
npm run dev
```

---

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/users` | Cria um usuário. |
| `GET` | `/users` | Lista usuários ativos. |
| `GET` | `/users/:id` | Busca um usuário. |
| `PUT` | `/users/:id` | Atualiza um usuário. |
| `DELETE` | `/users/:id` | Remove um usuário. |
| `POST` | `/tickets` | Cria e classifica um ticket. |
| `GET` | `/tickets` | Lista tickets ativos. |
| `GET` | `/tickets/:id` | Busca um ticket. |
| `PUT` | `/tickets/:id` | Atualiza um ticket. |
| `DELETE` | `/tickets/:id` | Remove um ticket. |
| `GET` | `/logs` | Exibe os logs registrados. |
| `GET` | `/health` | Retorna o status da API. |

---

## Testes

### Execução com Docker Compose

```bash
docker exec -it ticket-classification-api npm test
```

### Execução local

Compilar o projeto:

```bash
npm run build
```

Executar todos os testes:

```bash
npm test
```

---

## Exemplo de uso

### Criar e classificar um ticket

**Requisição**

**POST** `/tickets`

```json
{
  "solicitation": "Estou tendo erro no login ao tentar acessar o sistema",
  "userId": 1
}
```

**Resposta (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "solicitation": "Estou tendo erro no login ao tentar acessar o sistema",
    "channel": "SUPORTE_TECNICO",
    "status": "EM_ABERTO",
    "priority": 2,
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
}
```
> **Observação:** A Coleção Postman contendo todas os endpoints da API e a documentação sobre cada um está localizada na pasta /docs do repositório. Para acessar mais informações sobre o uso da rota no Postman basta acessar a aba Docs no Request.