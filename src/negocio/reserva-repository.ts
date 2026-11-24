import { NovaReserva, Reserva } from './reserva';

// Abstração definida pelo negócio (quem usa). A persistência a implementa.
export interface ReservaRepository {
  listar(salaId?: number): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | null>;
  // Devolve as reservas da sala que se sobrepõem ao período informado.
  // O repositório só consulta; QUEM DECIDE se isso é um conflito é o service.
  listarNoPeriodo(salaId: number, inicio: Date, fim: Date): Promise<Reserva[]>;
  criar(nova: NovaReserva): Promise<Reserva>;
  remover(id: number): Promise<void>;
}
