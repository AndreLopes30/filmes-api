# API de filmes - Desafio Overlabs

API Node.js que consome uma API externa de filmes, trata os dados recebidos de acordo com os requisitos do desafio e disponibiliza o resultado para consulta por meio da rota `GET /filmes`.

A aplicação foi desenvolvida utilizando os módulos nativos do Node.js, sem a necessidade de instalar um framework adicional.

## Como executar

Requisito: Node.js 24 ou outra versão com `fetch` nativo.

```bash
npm start
```

O servidor inicia, por padrão, na porta 3000. Para usar outra porta, defina `PORT` antes de executar o comando.

## Como acessar

Com o servidor em execução:

```bash
curl http://localhost:3000/filmes
```

A rota `/filmes` faz uma requisição GET à API externa, recebe os dados dos filmes, realiza as transformações necessárias e devolve uma resposta em formato JSON.

A resposta é um array JSON com todos os filmes recebidos da API externa, cada um no seguinte formato:

```json
{
  "titulo": "O Poderoso Chefão",
  "ano": 1972,
  "diretor": "Francis Ford Coppola",
  "genero": ["Crime", "Drama"],
  "duracaoSegundos": 10500,
  "notaIMDb": "9.2",
  "lucro": "$239 milhões",
  "maiorPremiacao": "Oscar de Melhor Filme",
  "sinopse": "Um chefão da máfia tenta transferir o controle de seu império clandestino para seu filho relutante."
}
```

## Passos realizados

1. Primeiro, analisei o PDF do desafio para entender o que precisava ser desenvolvido. Depois, organizei a estrutura do projeto e as dependências necessárias. Separei todos os requisitos em pequenos blocos para implementar cada funcionalidade individualmente.

2. Consultei a API de metadados indicada no desafio e identifiquei que a API externa responde com um objeto contendo o array `filmes`. Analisei os dados recebidos para entender quais propriedades precisavam ser transformadas ou removidas.

3. Optei por utilizar os módulos nativos do Node.js por praticidade, sem a necessidade de instalar um framework adicional. Mantive toda a lógica da aplicação no arquivo `server.js`.

4. Criei uma rota `GET /filmes` que faz uma requisição à API externa, recebe os dados dos filmes, realiza as transformações necessárias e devolve uma resposta em formato JSON.

5. Separei a transformação dos dados em uma função chamada `transformFilm` para desacoplar a lógica de transformação da lógica da rota, deixando o código mais organizado e facilitando os testes.

6. Fui implementando e testando cada funcionalidade isoladamente, até reunir todas as partes para formar a lógica completa da API.

7. Adicionei um tratamento de erros para que a aplicação retorne uma resposta em formato JSON sempre que não for possível consultar a API externa ou obter os dados corretamente.

8. Após implementar a rota `/filmes`, realizei uma requisição GET e conferi os dados retornados pela API para verificar se o resultado estava de acordo com os requisitos do desafio.

## Transformação aplicada

### Duração em segundos

A aplicação transforma a duração dos filmes de minutos para segundos, multiplicando o valor por 60.

Por exemplo:

```text
175 minutos × 60 = 10500 segundos
```

O resultado é retornado na propriedade `duracaoSegundos`.

### Nota IMDb

A aplicação procura a avaliação do IMDb na lista de avaliações do filme, pega o valor encontrado e o transforma em uma string para retornar na resposta.

Por exemplo:

```json
"notaIMDb": "9.2"
```

### Maior premiação

A aplicação compara os valores de relevância dos prêmios e retorna o nome daquele que possui a maior relevância.

O resultado é apresentado na propriedade `maiorPremiacao`.

### Sinopse

A aplicação dá prioridade à sinopse em português do Brasil (`pt-br`).

Caso não exista, procura uma em inglês (`en`).

Se nenhuma das duas estiver disponível, retorna a primeira sinopse encontrada.

A resposta contém apenas o texto da sinopse selecionada.

### Lucro

A aplicação calcula o lucro subtraindo o orçamento da bilheteria.

```text
Lucro = Bilheteria - Orçamento
```

Como os valores são recebidos em formato de string, primeiro são convertidos para números.

Para isso, a aplicação multiplica os valores em milhões por `1.000.000` e os valores em bilhões por `1.000.000.000`.

Depois da conversão, realiza a subtração e apresenta o resultado novamente em formato de string.

O resultado é exibido em milhões quando seu valor absoluto é menor que um bilhão e em bilhões nos demais casos.

A formatação mantém até três casas decimais e remove zeros desnecessários.

Por exemplo:

```text
Bilheteria: $2 bilhões
Orçamento: $6 milhões

Lucro: $1.994 bilhões
```

### Propriedades removidas

A aplicação remove as propriedades `locacoes`, `poster` e `trailer`, pois elas não devem aparecer no resultado final.

Optei por construir um novo objeto contendo apenas os campos apresentados no resultado esperado do desafio.

Portanto, o objeto final também não repassa `ratings`, `elenco`, `orcamento`, `bilheteria` e `premios`.

Essas propriedades são utilizadas quando necessário para realizar as transformações, mas não são incluídas na resposta final.

## Decisão sobre o lucro

Durante a análise do desafio, identifiquei uma diferença entre os valores apresentados no exemplo do PDF e os valores retornados pela API externa.

O PDF utiliza orçamento de `$6 milhões` e bilheteria de `$2 bilhões` para o filme "O Poderoso Chefão", mas apresenta o lucro como `$1.4 bilhões`.

Esse resultado não corresponde à subtração dos valores informados.

Além disso, a API consultada retorna uma bilheteria de `$245 milhões` para esse filme, diferente do valor apresentado no exemplo do PDF.

Optei por calcular o lucro utilizando os valores retornados pela API externa para que a aplicação seja dinâmica, e não dependa de valores fixos.

Dessa forma, se os dados forem alterados na API externa, o lucro será calculado com base nos novos valores.

Teste da API

Após finalizar a implementação, iniciei o servidor utilizando npm start e realizei uma requisição GET para a rota /filmes utilizando o curl.

curl.exe -i http://localhost:3000/filmes

A API retornou o status HTTP 200 OK e um array JSON contendo 8 filmes com os dados transformados.

Conferi o resultado retornado para verificar a conversão da duração para segundos, a nota IMDb em formato de string, o cálculo do lucro, a maior premiação e a seleção de uma única sinopse.

Também verifiquei que as propriedades locacoes, poster e trailer não aparecem na resposta final.

## Aprendizados

Como Node.js não é minha stack principal, o desafio foi uma oportunidade para desenvolver minhas habilidades com essa tecnologia.

Durante a implementação, pratiquei principalmente o consumo de APIs externas e o tratamento de dados, aplicando as transformações necessárias para retornar os filmes no formato solicitado.
