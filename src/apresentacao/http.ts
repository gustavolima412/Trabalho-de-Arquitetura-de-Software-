import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ErroDeConflito, ErroDeValidacao, ErroNaoEncontrado } from '../negocio/erros';

// Express 4 não captura erros de funções async: este wrapper os repassa ao middleware de erro.
export function tratar(
  fn: (req: Request, res: Response) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export function lerInteiro(valor: unknown, campo: string): number {
  const n = Number(valor);
  if (valor === undefined || valor === '' || !Number.isInteger(n)) {
    throw new ErroDeValidacao(`${campo} deve ser um número inteiro`);
  }
  return n;
}

// Traduz erros de negócio em respostas HTTP.
export function middlewareDeErros(
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (erro instanceof ErroDeValidacao) {
    res.status(400).json({ erro: erro.message });
  } else if (erro instanceof ErroNaoEncontrado) {
    res.status(404).json({ erro: erro.message });
  } else if (erro instanceof ErroDeConflito) {
    res.status(409).json({ erro: erro.message });
  } else {
    console.error(erro);
    res.status(500).json({ erro: 'erro interno' });
  }
}
