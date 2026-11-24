import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { ErroDeConflito, ErroDeValidacao, ErroNaoEncontrado } from './erros';
import { NovaReserva, Reserva } from './reserva';
import { ReservaRepository } from './reserva-repository';
import { ReservaService } from './reserva-service';
import { NovaSala, Sala } from './sala';
import { SalaRepository } from './sala-repository';

// Repositórios FALSOS em memória: só é possível testar o negócio sem banco
// porque o service depende de interfaces (DIP + injeção de dependência).
class SalaRepoFalso implements SalaRepository {
  salas: Sala[] = [{ id: 1, nome: 'Lab 1', capacidade: 30 }];
  async listar() { return this.salas; }
  async buscarPorId(id: number) { return this.salas.find((s) => s.id === id) ?? null; }
  async buscarPorNome(nome: string) { return this.salas.find((s) => s.nome === nome) ?? null; }
  async criar(nova: NovaSala) { const s = { id: this.salas.length + 1, ...nova }; this.salas.push(s); return s; }
}

class ReservaRepoFalso implements ReservaRepository {
  reservas: Reserva[] = [];
  async listar(salaId?: number) { return this.reservas.filter((r) => salaId === undefined || r.salaId === salaId); }
  async buscarPorId(id: number) { return this.reservas.find((r) => r.id === id) ?? null; }
  async listarNoPeriodo(salaId: number, inicio: Date, fim: Date) {
    return this.reservas.filter((r) => r.salaId === salaId && r.inicio < fim && r.fim > inicio);
  }
  async criar(nova: NovaReserva) { const r = { id: this.reservas.length + 1, ...nova }; this.reservas.push(r); return r; }
  async remover(id: number) { this.reservas = this.reservas.filter((r) => r.id !== id); }
}

const d = (hora: string) => new Date(`2026-12-01T${hora}:00Z`);
const dados = (inicio: string, fim: string): NovaReserva =>
  ({ salaId: 1, responsavel: 'Ana', inicio: d(inicio), fim: d(fim) });

describe('ReservaService', () => {
  let service: ReservaService;
  beforeEach(() => {
    service = new ReservaService(new ReservaRepoFalso(), new SalaRepoFalso());
  });

  it('cria uma reserva válida', async () => {
    const r = await service.criar(dados('10:00', '11:00'));
    assert.equal(r.salaId, 1);
  });

  it('recusa reserva que se sobrepõe a outra na mesma sala', async () => {
    await service.criar(dados('10:00', '12:00'));
    await assert.rejects(service.criar(dados('11:00', '13:00')), ErroDeConflito);
  });

  it('permite reservas coladas (fim de uma = início da outra)', async () => {
    await service.criar(dados('10:00', '11:00'));
    await service.criar(dados('11:00', '12:00'));
  });

  it('recusa fim anterior ou igual ao início', async () => {
    await assert.rejects(service.criar(dados('11:00', '10:00')), ErroDeValidacao);
    await assert.rejects(service.criar(dados('11:00', '11:00')), ErroDeValidacao);
  });

  it('recusa sala inexistente', async () => {
    await assert.rejects(service.criar({ ...dados('10:00', '11:00'), salaId: 99 }), ErroNaoEncontrado);
  });

  it('cancela reserva existente e recusa inexistente', async () => {
    const r = await service.criar(dados('10:00', '11:00'));
    await service.cancelar(r.id);
    await assert.rejects(service.cancelar(r.id), ErroNaoEncontrado);
  });
});
