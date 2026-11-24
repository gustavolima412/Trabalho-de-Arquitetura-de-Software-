export interface Reserva {
  id: number;
  salaId: number;
  responsavel: string;
  inicio: Date;
  fim: Date;
}

export interface NovaReserva {
  salaId: number;
  responsavel: string;
  inicio: Date;
  fim: Date;
}
