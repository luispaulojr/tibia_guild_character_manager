# Backend

Este é o backend da aplicação que fornece dados dos personagens de uma guilda no Tibia.

## Tecnologias Utilizadas

- Node.js
- Express
- Socket.io
- Axios
- SQLite
- Luxon

## Funcionalidades

- Fornecer dados dos personagens e guilda
- Atualizar papel (role) e localização dos personagens
- Calcular e converter o tempo online dos personagens de CET para BRT

## Como Executar

### Pré-requisitos

- Node.js
- npm ou yarn

### Passos

1. Instale as dependências:

    ```bash
    npm install
    ```
2. Provisionar base:
    ```sh
    node initDb.js
    ```
3. Inicie o servidor:

    ```bash
    npm start
    ```

3. O servidor estará rodando em `http://localhost:4000`.

## Estrutura do Projeto

```
backend
├── src
│   └── index.js
├── characters.db
├── package.json
└── README.md
```

## Contribuição

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

## Licença

Este projeto está licenciado sob a licença MIT.
