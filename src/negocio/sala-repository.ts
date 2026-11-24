import { NovaSala, Sala } from './sala';

// Abstração definida pelo negócio (quem usa). A persistência a implementa.
export interface SalaRepository {
  listar(): Promise<Sala[]>;
  buscarPorId(id: number): Promise<Sala | null>;
  buscarPorNome(nome: string): Promise<Sala | null>;
  criar(nova: NovaSala): Promise<Sala>;
}
