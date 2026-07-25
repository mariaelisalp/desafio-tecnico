## Testes

### Execução com Docker Compose

Caso a aplicação esteja sendo executada em containers, os testes devem ser executados dentro do container da API:

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
    "priority": 1,
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
}
```