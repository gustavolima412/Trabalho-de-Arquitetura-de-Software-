import { Pool } from 'pg';

export function criarPool(databaseUrl: string): Pool {
  const pool = new Pool({ connectionString: databaseUrl });
  // Sem este handler, a queda de uma conexão ociosa derrubaria o processo inteiro.
  pool.on('error', (erro) => console.error('erro em conexão ociosa do banco:', erro.message));
  return pool;
}
