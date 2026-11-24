// Governança automatizada das camadas fechadas (mesma ideia do `fronteira.ts` da aula 07).
// Varre src/ e confere quem importa quem. Uso: npm run verificar-camadas
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const RAIZ = 'src';

// Para cada camada: o que ela NÃO pode importar (pastas internas e bibliotecas).
const PROIBIDO = {
  apresentacao: { pastas: ['persistencia'], libs: ['pg'] },
  negocio: { pastas: ['persistencia', 'apresentacao'], libs: ['pg', 'express'] },
  persistencia: { pastas: ['apresentacao'], libs: ['express'] },
};

function arquivos(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : caminho.endsWith('.ts') ? [caminho] : [];
  });
}

const importRegex = /(?:from\s+|require\(\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g;
const violacoes = [];

for (const arquivo of arquivos(RAIZ)) {
  const partes = relative(RAIZ, arquivo).split(sep);
  const camada = partes.length > 1 ? partes[0] : null; // main.ts (composition root) é livre
  if (!camada || !PROIBIDO[camada]) continue;
  const regras = PROIBIDO[camada];
  const texto = readFileSync(arquivo, 'utf8');
  for (const [, destino] of texto.matchAll(importRegex)) {
    for (const pasta of regras.pastas) {
      if (destino.split('/').includes(pasta)) {
        violacoes.push(`${arquivo}: a camada "${camada}" não pode importar "${pasta}" (${destino})`);
      }
    }
    for (const lib of regras.libs) {
      if (destino === lib || destino.startsWith(lib + '/')) {
        violacoes.push(`${arquivo}: a camada "${camada}" não pode usar a biblioteca "${lib}"`);
      }
    }
  }
}

if (violacoes.length > 0) {
  console.error(violacoes.join('\n'));
  process.exit(1);
}
console.log('camadas respeitadas');
