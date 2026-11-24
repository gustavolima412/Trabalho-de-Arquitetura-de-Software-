import { ErroDeConflito, ErroDeValidacao } from './erros';
import { NovaSala, Sala } from './sala';
import { SalaRepository } from './sala-repository';

export class SalaService {
  // Injeção de dependência: recebe a ABSTRAÇÃO pelo construtor.
  constructor(private readonly salas: SalaRepository) {}

  async listar(): Promise<Sala[]> {
    return this.salas.listar();
  }

  async criar(dados: NovaSala): Promise<Sala> {
    const nome = (dados.nome ?? '').trim();
    if (nome === '') {
      throw new ErroDeValidacao('o nome da sala é obrigatório');
    }
    if (!Number.isInteger(dados.capacidade) || dados.capacidade <= 0) {
      throw new ErroDeValidacao('a capacidade deve ser um inteiro maior que zero');
    }
    if ((await this.salas.buscarPorNome(nome)) !== null) {
      throw new ErroDeConflito(`já existe uma sala chamada "${nome}"`);
    }
    return this.salas.criar({ nome, capacidade: dados.capacidade });
  }
}
