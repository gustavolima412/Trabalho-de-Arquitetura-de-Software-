-- Executado automaticamente pelo container do PostgreSQL na primeira inicialização
-- (volume vazio), via /docker-entrypoint-initdb.d/.

CREATE TABLE sala (
    id          SERIAL        PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL UNIQUE,
    capacidade  INTEGER       NOT NULL CHECK (capacidade > 0)
);

CREATE TABLE reserva (
    id           SERIAL        PRIMARY KEY,
    sala_id      INTEGER       NOT NULL REFERENCES sala (id),
    responsavel  VARCHAR(100)  NOT NULL,
    inicio       TIMESTAMPTZ   NOT NULL,
    fim          TIMESTAMPTZ   NOT NULL,
    CHECK (fim > inicio)
);

CREATE INDEX idx_reserva_sala_inicio ON reserva (sala_id, inicio);
