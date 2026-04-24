## 🚀 Tecnologias e Arquitetura

O ecossistema é composto por 4 contentainers principais:

* **Frontend (UI):** React.js + Vite (Porta `5173`)
* **Microsserviço de Pacientes:** Node.js + Express (Porta `3000`)
    * *Destaque:* Encriptação determinística de CPF (AES-256) nativa para LGPD e segurança com `helmet`.
* **Microsserviço de Médicos:** PHP 8.2 + Apache + PDO (Porta `8000`)
* **Base de Dados:** MySQL 8.0 (Porta `3306`)

---

## 🔒 Funcionalidades de Segurança
* **Conformidade com LGPD:** Os CPFs dos pacientes são encriptados na base de dados (AES-256-CBC) garantindo que, em caso de fuga de dados, as informações sensíveis permanecem ilegíveis.
* **Whitelisting de CORS:** As APIs estão bloqueadas para aceitar apenas requisições da origem do Frontend (`http://localhost:5173` ou domínio via variável de ambiente).

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados na sua máquina.

### Passo a Passo

1.  **Clone o repositório** para a sua máquina local:
   
3.  **Crie um .env** ele precisa ter uma senha pro banco de dados como:
    ```bash
    MYSQL_ROOT_PASSWORD=root
    ```

5.  **Inicie a infraestrutura com o Docker:**
    Este comando vai baixar as imagens, construir os serviços, injetar o ficheiro `init.sql` no MySQL e levantar a aplicação.
    ```bash
    docker-compose up -d --build
    ```

6.  **Abra a Aplicação:**
    * Abra o seu navegador e vá a: `http://localhost:5173`

---

## 📂 Estrutura de Diretórios (Clean Architecture)

A aplicação segue rigorosamente a separação de responsabilidades. Ambos os backends partilham da mesma filosofia arquitetural:

```text
/aplis-clinic
├── /app                  # Frontend React (Vite)
├── /backendjs            # API Node.js (Pacientes)
│   ├── /src
│   │   ├── /controllers  # Regras de Negócio e Validações
│   │   ├── /models       # Comunicação exclusiva com MySQL
│   │   └── /routes       # Mapeamento de Endpoints HTTP
│   └── index.js          # Entrypoint e Middlewares (Helmet/CORS)
├── /backendphp           # API PHP (Médicos)
│   ├── /src
│   │   ├── /Controller   # Regras de Negócio e Tratamento de Exceções
│   │   ├── /Model        # Queries e Prepared Statements
│   │   └── /routes       # Roteamento de Requests
│   └── index.php         # Front Controller e Headers HTTP
├── docker-compose.yml    # Orquestração dos Containers
└── init.sql              # Estrutura e Criação das Tabelas MySQL
