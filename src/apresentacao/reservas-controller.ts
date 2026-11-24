import { Request, Response } from 'express';
import { ReservaService } from '../negocio/reserva-service';
import { lerInteiro } from './http';

export class ReservasController {
  constructor(private readonly service: ReservaService) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const salaId = req.query.salaId === undefined ? undefined : lerInteiro(req.query.salaId, 'salaId');
    res.json(await this.service.listar(salaId));
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const { salaId, responsavel, inicio, fim } = req.body ?? {};
    const reserva = await this.service.criar({
      salaId: lerInteiro(salaId, 'salaId'),
      responsavel: typeof responsavel === 'string' ? responsavel : '',
      inicio: new Date(inicio),
      fim: new Date(fim),
    });
    res.status(201).json(reserva);
  };

  cancelar = async (req: Request, res: Response): Promise<void> => {
    await this.service.cancelar(lerInteiro(req.params.id, 'id'));
    res.status(204).send();
  };
}
