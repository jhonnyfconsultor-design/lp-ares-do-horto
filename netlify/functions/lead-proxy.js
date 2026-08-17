/**
 * Netlify Function — lead-proxy.js
 * Recebe o payload do quiz e encaminha pro Imobit CRM server-side.
 * Resolve o bloqueio de CORS: o browser chama /netlify/functions/lead-proxy
 * (mesmo domínio), e a function faz o POST externo sem restrição de CORS.
 */

const IMOBIT_URL = 'https://www.imobitcrm.com.br/api/public/leads';
const IMOBIT_KEY = 'imb_m7IleWiviLVE5WEzLnbqW9vJVRM8Tnq13pjipqodsIY';

exports.handler = async function (event) {
  /* Só aceita POST */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  /* Encaminha pro Imobit CRM com autenticação */
  try {
    const resp = await fetch(IMOBIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IMOBIT_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.text();

    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: data
    };
  } catch (e) {
    console.error('Erro ao encaminhar lead:', e);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Falha ao conectar com o CRM', detail: e.message })
    };
  }
};
