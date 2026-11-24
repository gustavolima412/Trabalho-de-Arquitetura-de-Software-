import { ErroDeConflito, ErroDeValidacao, ErroNaoEncontrado } from './erros';
import { NovaReserva, Reserva } from './reserva';
import { ReservaRepository } from './reserva-repository';
import { SalaRepository } from './sala-repository';

export class ReservaService {
  constructor(
    private readonly reservas: ReservaRepository,
    private readonly salas: SalaRepository,
  ) {}

  async listar(salaId?: number): Promise<Reserva[]> {
    return this.reservas.listar(salaId);
  }

  async criar(dados: NovaReserva): Promise<Reserva> {
    const responsavel = (dados.responsavel ?? '').trim();
    if (responsavel === '') {
      throw new ErroDeValidacao('o responsável é obrigatório');
    }
    if (Number.isNaN(dados.inicio.getTime()) || Number.isNaN(dados.fim.getTime())) {
      throw new ErroDeValidacao('início e fim devem ser datas válidas');
    }
    if (dados.fim.getTime() <= dados.inicio.getTime()) {
      throw new ErroDeValidacao('o fim deve ser posterior ao início');
    }
    if ((await this.salas.buscarPorId(dados.salaId)) === null) {
      throw new ErroNaoEncontrado(`a sala ${dados.salaId} não existe`);
    }

    // REGRA CENTRAL: não pode haver sobreposição de horário na mesma sala.
    // Reservas "coladas" (fim de uma = início de outra) são permitidas.
    const conflitantes = await this.reservas.listarNoPeriodo(dados.salaId, dados.inicio, dados.fim);
    if (conflitantes.length > 0) {
      throw new ErroDeConflito(
        `a sala ${dados.salaId} já está reservada nesse período (reserva ${conflitantes[0].id})`,
      );
    }

    return this.reservas.criar({ ...dados, responsavel });
  }

  async cancelar(id: number): Promise<void> {
    if ((await this.reservas.buscarPorId(id)) === null) {
      throw new ErroNaoEncontrado(`a reserva ${id} não existe`);
    }
    await this.reservas.remover(id);
  }
}
