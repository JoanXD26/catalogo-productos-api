const valorSecreto = process.env.JWT_SECRET ?? '';
const segundosVigencia = Number(process.env.JWT_TTL_SECONDS ?? '3600');

if (!/^[a-f0-9]{64}$/i.test(valorSecreto)) {
  throw new Error('JWT_SECRET debe contener 64 caracteres hexadecimales.');
}

if (!Number.isInteger(segundosVigencia) || segundosVigencia < 1 || segundosVigencia > 86400) {
  throw new Error('JWT_TTL_SECONDS debe ser un entero entre 1 y 86400.');
}

module.exports = {
  secreto: Buffer.from(valorSecreto, 'hex'),
  algoritmo: 'HS256',
  segundosVigencia
};