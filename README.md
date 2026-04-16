# RootDocs

Base de conhecimento pessoal com controle de acesso por perfil. Crie, organize e consulte posts em Markdown sobre redes, virtualização, programação e infraestrutura.

## Funcionalidades

- **Markdown** — Posts escritos em Markdown com preview em tempo real
- **Categorias** — Organização por categoria (Redes, Proxmox, Programação, Linux, Segurança, DevOps)
- **Busca** — Pesquisa por título e conteúdo
- **RBAC** — Dois perfis: **Leitor** (apenas leitura) e **Editor** (CRUD completo + gerência de usuários)
- **Dark/Light** — Alternância de tema com persistência local
- **Refresh Token** — Sessão renovada automaticamente sem necessidade de re-login

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Spring Boot 3.4+, Java 21, Maven |
| Segurança | Spring Security 6, JWT stateless |
| Banco | PostgreSQL 16 |
| Frontend | Vue 3, Vite, Pinia, Vuetify 3 |

## Perfis de acesso

| Perfil | Permissões |
|--------|-----------|
| **Leitor** | Visualizar e buscar posts |
| **Editor** | Tudo do Leitor + criar, editar, excluir posts e gerenciar usuários |

## Executando

```bash
# 1. Banco de dados
docker compose up -d

# 2. Backend
cd backend && mvn spring-boot:run

# 3. Frontend
cd frontend && npm install && npm run dev
```

Acesse `http://localhost:5173`

## Usuários padrão

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `rootdocs` | Editor |
| `leitor` | `rootdocs` | Leitor |

Livre para usar, modificar e distribuir.