import { Request, Response } from 'express';
import { SalaService } from '../negocio/sala-service';
import { lerInteiro } from './http';

export class SalasController {
  constructor(private readonly service: SalaService) {}

  listar = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listar());
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const { nome, capacidade } = req.body ?? {};
    const sala = await this.service.criar({
      nome: typeof nome === 'string' ? nome : '',
      capacidade: lerInteiro(capacidade, 'capacidade'),
    });
    res.status(201).json(sala);
  };
}
