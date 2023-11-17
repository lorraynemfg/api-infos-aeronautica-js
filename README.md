# API de Informações Meteorológicas e Notícias

Bem-vindo à API de Informações Meteorológicas e Notícias! Esta API foi desenvolvida para fornecer informações meteorológicas detalhadas de aeroportos, bem como notícias em tempo real.

## Rotas Disponíveis

### 1. Informações sobre Aeroportos

- **Rota:** `/info-aeroportos/:aeroporto`
- **Método:** GET
- **Descrição:** Esta rota retorna informações sobre aeroportos em um país específico.
- **Parâmetros:**
  - `aeroporto`: Código do aeroporto (por exemplo, "brasil").

### 2. Informações Meteorológicas

- **Rota:** `/info-meteorologica/:cod`
- **Método:** GET
- **Descrição:** Fornece informações meteorológicas detalhadas, incluindo pressão atmosférica, direção do vento, temperatura e visibilidade, para um aeroporto específico.
- **Parâmetros:**
  - `cod`: Código do aeroporto (por exemplo, "SBBH").

### 3. Pesquisa de Notícias

- **Rota:** `/pesquisa`
- **Método:** GET
- **Descrição:** Realiza uma pesquisa por notícias com base em um estado, palavra-chave e data específicos.
- **Parâmetros:**
  - `state`: Estado para pesquisa (opcional).
  - `key_word`: Palavra-chave para pesquisa (opcional).
  - `data`: Data a partir da qual as notícias são recuperadas (opcional).
 
## Exemplos de Uso

### 1. Obter Informações sobre Aeroportos (Brasil)

```http
GET /info-aeroportos/brasil
