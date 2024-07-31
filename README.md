# Tibia Guild Character Manager

Este é um projeto de gerenciamento de personagens de guilda do Tibia. O projeto é dividido em três branches principais: `main`, `frontend`, e `backend`.

## Branches

- **main**: Contém o arquivo `README.md` e a licença do projeto.
- **frontend**: Contém o código da interface do usuário, desenvolvido em React.
- **backend**: Contém o código do servidor backend, desenvolvido em Node.js com Express.

## Estrutura do Projeto


### main

Esta branch contém o `README.md` e a licença do projeto.

### frontend

Esta branch contém o código React para a interface do usuário. O código está localizado no diretório `src` e o arquivo principal é `App.js`. A interface exibe informações sobre os personagens da guilda, como nome, nível, vocação, status, rank na guilda, papel, localização e tempo online.

### backend

Esta branch contém o código do servidor backend. O backend é responsável por buscar dados da API do Tibia, armazenar detalhes adicionais dos personagens em um banco de dados SQLite e servir esses dados para o frontend. O código principal está no arquivo `src/index.js`.

## Funcionalidades

- **Gerenciamento de Personagens**: Exibe uma lista de personagens da guilda com detalhes como nome, nível, vocação, status, rank na guilda, papel, localização e tempo online.
- **Filtragem**: Permite filtrar os personagens por papel e status.
- **Atualização de Detalhes**: Permite atualizar o papel e a localização dos personagens diretamente pela interface do usuário.
- **Cópia de Comando Exiva**: Facilita a cópia do comando `exiva` para localizar personagens no jogo.

## Instalação

### Backend

1. Clone a branch `backend`:
    ```sh
    git clone -b backend https://github.com/luispaulojr/tibia_guild_character_manager.git -b backend server
    ```
2. Navegue até o diretório do projeto:
    ```sh
    cd server
    ```
3. Instale as dependências:
    ```sh
    npm install
    ```
4. Provisionar base:
    ```sh
    node initDb.js
    ```
5. Inicie o servidor:
    ```sh
    npm start
    ```

### Frontend

1. Clone a branch `frontend`:
    ```sh
    git clone -b frontend https://github.com/luispaulojr/tibia_guild_character_manager.git -b frontend app
    ```
2. Navegue até o diretório do projeto:
    ```sh
    cd app
    ```
3. Instale as dependências:
    ```sh
    npm install
    ```
4. Inicie a aplicação React:
    ```sh
    npm start
    ```

## Como Usar

1. Certifique-se de que o backend está rodando.
2. Inicie o frontend.
3. Acesse `http://localhost:3000` no seu navegador para visualizar a aplicação.
4. Utilize os filtros para visualizar os personagens conforme desejado.
5. Clique nos ícones de papel para alterar o papel de um personagem.
6. Utilize os campos de entrada para alterar a localização de um personagem.
7. Clique no ícone de clipboard para copiar o comando `exiva`.

## Tecnologias Utilizadas

- **Frontend**: React, Socket.io
- **Backend**: Node.js, Express, SQLite, Axios
- **Outras**: Luxon (para manipulação de datas e fusos horários)

## Contribuição

1. Fork o repositório.
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4. Push para a branch (`git push origin feature/AmazingFeature`).
5. Abra um Pull Request.

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

