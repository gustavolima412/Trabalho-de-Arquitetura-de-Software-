import { Pool } from 'pg';
import { NovaSala, Sala } from '../negocio/sala';
import { SalaRepository } from '../negocio/sala-repository';

// Implementação concreta (detalhe): conhece PostgreSQL, SQL e a tabela "sala".
export class SalaRepositoryPg implements SalaRepository {
  constructor(private readonly pool: Pool) {}

  async listar(): Promise<Sala[]> {
    const r = await this.pool.query('SELECT id, nome, capacidade FROM sala ORDER BY id');
    return r.rows;
  }

  async buscarPorId(id: number): Promise<Sala | null> {
    const r = await this.pool.query('SELECT id, nome, capacidade FROM sala WHERE id = $1', [id]);
    return r.rows[0] ?? null;
  }

  async buscarPorNome(nome: string): Promise<Sala | null> {
    const r = await this.pool.query('SELECT id, nome, capacidade FROM sala WHERE nome = $1', [nome]);
    return r.rows[0] ?? null;
  }

  async criar(nova: NovaSala): Promise<Sala> {
    const r = await this.pool.query(
      'INSERT INTO sala (nome, capacidade) VALUES ($1, $2) RETURNING id, nome, capacidade',
      [nova.nome, nova.capacidade],
    );
    return r.rows[0];
  }
}
