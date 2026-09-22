import http from 'node:http';
import { fileURLToPath } from 'node:url';

const METADATA_API_URL =
  'https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws/';
const PORT = Number(process.env.PORT) || 3000;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function parseMoney(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Valor monetário deve ser uma string.');
  }

  const match = value
    .trim()
    .match(/^\$\s*([\d]+(?:[\.,]\d+)?)\s*(milh(?:ão|oes|ões)|bilh(?:ão|oes|ões))$/i);

  if (!match) {
    throw new TypeError(`Formato monetário inválido: ${value}`);
  }

  const amount = Number(match[1].replace(',', '.'));
  const unit = match[2].toLowerCase();
  const multiplier = unit.startsWith('milh') ? 1_000_000 : 1_000_000_000;

  if (!Number.isFinite(amount)) {
    throw new TypeError(`Valor monetário inválido: ${value}`);
  }

  return amount * multiplier;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError('Não foi possível formatar o lucro.');
  }

  const absoluteValue = Math.abs(value);
  const useBillions = absoluteValue >= 1_000_000_000;
  const divisor = useBillions ? 1_000_000_000 : 1_000_000;
  const unit = useBillions ? 'bilhões' : 'milhões';
  const amount = value / divisor;
  const formattedAmount = amount.toFixed(3).replace(/\.?(0+)$/, '');

  return `$${formattedAmount} ${unit}`;
}

export function calculateProfit(bilheteria, orcamento) {
  return formatMoney(parseMoney(bilheteria) - parseMoney(orcamento));
}

export function transformFilm(film) {
  const imdbRating = film.ratings?.find((rating) => rating.fonte === 'IMDb');
  const highestAward = film.premios?.reduce(
    (highest, award) => (!highest || award.relevancia > highest.relevancia ? award : highest),
    undefined,
  );
  const synopsis =
    film.sinopse?.find((item) => item.idioma === 'pt-br') ??
    film.sinopse?.find((item) => item.idioma === 'en') ??
    film.sinopse?.[0];

  if (
    !Number.isFinite(film.duracao) ||
    !imdbRating ||
    !Number.isFinite(imdbRating.valor) ||
    !highestAward ||
    typeof highestAward.nome !== 'string' ||
    highestAward.nome.trim() === '' ||
    !synopsis ||
    typeof synopsis.texto !== 'string'
  ) {
    throw new TypeError('Filme recebido não possui os metadados necessários.');
  }

  return {
    titulo: film.titulo,
    ano: film.ano,
    diretor: film.diretor,
    genero: film.genero,
    duracaoSegundos: film.duracao * 60,
    notaIMDb: String(imdbRating.valor),
    lucro: calculateProfit(film.bilheteria, film.orcamento),
    maiorPremiacao: highestAward.nome,
    sinopse: synopsis.texto,
  };
}

async function getTransformedFilms() {
  let upstreamResponse;

  try {
    upstreamResponse = await fetch(METADATA_API_URL);
  } catch {
    const error = new Error('Não foi possível conectar à API de metadados.');
    error.statusCode = 502;
    throw error;
  }

  if (!upstreamResponse.ok) {
    const error = new Error(
      `A API de metadados respondeu com status ${upstreamResponse.status}.`,
    );
    error.statusCode = 502;
    throw error;
  }

  let payload;
  try {
    payload = await upstreamResponse.json();
  } catch {
    const error = new Error('A API de metadados retornou JSON inválido.');
    error.statusCode = 502;
    throw error;
  }

  if (!Array.isArray(payload?.filmes)) {
    const error = new Error('A API de metadados retornou um formato inesperado.');
    error.statusCode = 502;
    throw error;
  }

  try {
    return payload.filmes.map(transformFilm);
  } catch {
    const error = new Error('A API de metadados contém um filme em formato inválido.');
    error.statusCode = 502;
    throw error;
  }
}

export function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method !== 'GET' || url.pathname !== '/filmes') {
      sendJson(response, 404, { erro: 'Rota não encontrada.' });
      return;
    }

    try {
      const films = await getTransformedFilms();
      sendJson(response, 200, films);
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, { erro: error.message });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(PORT, () => {
    console.log(`API disponível em http://localhost:${PORT}/filmes`);
  });
}
