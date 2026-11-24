import { Pool } from 'pg';
import { NovaReserva, Reserva } from '../negocio/reserva';
import { ReservaRepository } from '../negocio/reserva-repository';

const COLUNAS = 'id, sala_id AS "salaId", responsavel, inicio, fim';

// Implementação concreta (detalhe): conhece PostgreSQL, SQL e a tabela "reserva".
export class ReservaRepositoryPg implements ReservaRepository {
  constructor(private readonly pool: Pool) {}

  async listar(salaId?: number): Promise<Reserva[]> {
    if (salaId === undefined) {
      const r = await this.pool.query(`SELECT ${COLUNAS} FROM reserva ORDER BY inicio`);
      return r.rows;
    }
    const r = await this.pool.query(
      `SELECT ${COLUNAS} FROM reserva WHERE sala_id = $1 ORDER BY inicio`,
      [salaId],
    );
    return r.rows;
  }

  async buscarPorId(id: number): Promise<Reserva | null> {
    const r = await this.pool.query(`SELECT ${COLUNAS} FROM reserva WHERE id = $1`, [id]);
    return r.rows[0] ?? null;
  }

  async listarNoPeriodo(salaId: number, inicio: Date, fim: Date): Promise<Reserva[]> {
    // Dois intervalos se sobrepõem quando: inicioExistente < fimNovo E fimExistente > inicioNovo
    const r = await this.pool.query(
      `SELECT ${COLUNAS} FROM reserva
       WHERE sala_id = $1 AND inicio < $3 AND fim > $2
       ORDER BY inicio`,
      [salaId, inicio, fim],
    );
    return r.rows;
  }

  async criar(nova: NovaReserva): Promise<Reserva> {
    const r = await this.pool.query(
      `INSERT INTO reserva (sala_id, responsavel, inicio, fim)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUNAS}`,
      [nova.salaId, nova.responsavel, nova.inicio, nova.fim],
    );
    return r.rows[0];
  }

  async remover(id: number): Promise<void> {
    await this.pool.query('DELETE FROM reserva WHERE id = $1', [id]);
  }
}
