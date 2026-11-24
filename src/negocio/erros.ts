// Erros da camada de negócio. A camada de apresentação decide como
// traduzi-los (ex.: para códigos HTTP); o negócio não sabe que HTTP existe.

export class ErroDeValidacao extends Error {}
export class ErroNaoEncontrado extends Error {}
export class ErroDeConflito extends Error {}
