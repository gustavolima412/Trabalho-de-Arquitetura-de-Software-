// COMPOSITION ROOT: único arquivo que conhece as classes concretas de todas as camadas.
// É aqui (e só aqui) que acontecem os `new` das implementações e a injeção de dependência.
import { criarApp } from './apresentacao/app';
import { ReservasController } from './apresentacao/reservas-controller';
import { SalasController } from './apresentacao/salas-controller';
import { ReservaService } from './negocio/reserva-service';
import { SalaService } from './negocio/sala-service';
import { criarPool } from './persistencia/conexao';
import { ReservaRepositoryPg } from './persistencia/reserva-repository-pg';
import { SalaRepositoryPg } from './persistencia/sala-repository-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('variável de ambiente DATABASE_URL não definida');
}
const porta = Number(process.env.PORT ?? 3000);

// Persistência (detalhes)
const pool = criarPool(databaseUrl);
const salaRepo = new SalaRepositoryPg(pool);
const reservaRepo = new ReservaRepositoryPg(pool);

// Negócio (recebe as abstrações pelo construtor)
const salaService = new SalaService(salaRepo);
const reservaService = new ReservaService(reservaRepo, salaRepo);

// Apresentação (recebe o negócio pelo construtor)
const app = criarApp(new SalasController(salaService), new ReservasController(reservaService));

app.listen(porta, () => console.log(`API de reserva de salas em http://localhost:${porta}`));
