import express, { Express } from 'express';
import { middlewareDeErros, tratar } from './http';
import { ReservasController } from './reservas-controller';
import { SalasController } from './salas-controller';

// Monta as 5 rotas da API. Recebe os controllers prontos (injeção de dependência).
export function criarApp(salas: SalasController, reservas: ReservasController): Express {
  const app = express();
  app.use(express.json());

  app.post('/salas', tratar(salas.criar));
  app.get('/salas', tratar(salas.listar));

  app.post('/reservas', tratar(reservas.criar));
  app.get('/reservas', tratar(reservas.listar));
  app.delete('/reservas/:id', tratar(reservas.cancelar));

  app.use(middlewareDeErros);
  return app;
}
