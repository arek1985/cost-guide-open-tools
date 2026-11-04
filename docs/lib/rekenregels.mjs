// Pure functions: no network, storage, prices, tax eligibility or customer data.
function fixed(value, decimals, label, maximum) {
  const text = String(value).trim().replace(',', '.');
  if (!new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`).test(text)) {
    throw new Error(`${label}: gebruik een niet-negatief getal met maximaal ${decimals} decimalen, zonder duizendtallen.`);
  }
  const [whole, fraction = ''] = text.split('.');
  const result = Number(whole) * 10 ** decimals + Number(fraction.padEnd(decimals, '0'));
  if (!Number.isSafeInteger(result) || result > maximum) throw new Error(`${label}: waarde buiten het ondersteunde bereik.`);
  return result;
}
function list(value, label) {
  if (!Array.isArray(value) || value.length > 100) throw new Error(`${label}: gebruik een lijst met maximaal 100 regels.`);
  return value;
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 200) throw new Error(`${label}: vul een korte tekst in.`);
  return value.trim();
}
export function nettoOppervlakte({vlakken, openingen = []}) {
  const area = rows => list(rows, 'Vlakken').reduce((sum, row) => {
    const length = fixed(row.lengte, 2, 'Lengte in meter', 100000);
    const height = fixed(row.hoogte, 2, 'Hoogte in meter', 100000);
    return sum + length * height;
  }, 0);
  const bruto = area(vlakken), aftrek = area(openingen);
  if (aftrek > bruto) throw new Error('De opgegeven openingen zijn groter dan de opgegeven vlakken.');
  return {brutoM2: bruto / 10000, openingenM2: aftrek / 10000, nettoM2: (bruto - aftrek) / 10000};
}
export function offerteTotaal({regels}) {
  let nettoCent = 0, btwCent = 0;
  const uitsplitsing = list(regels, 'Offerte').map(row => {
    const netto = fixed(row.netto, 2, 'Nettobedrag', 100000000);
    const basispunten = fixed(row.btwPercentage, 2, 'Btw-percentage', 10000);
    // Round each non-negative line's VAT half up to a whole cent.
    const btw = Number((BigInt(netto) * BigInt(basispunten) + 5000n) / 10000n);
    nettoCent += netto; btwCent += btw;
    return {omschrijving: text(row.omschrijving, 'Omschrijving'), nettoCent: netto, btwCent: btw, brutoCent: netto + btw};
  });
  return {nettoCent, btwCent, brutoCent: nettoCent + btwCent, afronding: 'btw per regel, halve cent naar boven', regels: uitsplitsing};
}
export function scopeOverzicht({taken}) {
  const result = {inbegrepen: [], uitgesloten: [], bespreken: []};
  const seen = new Set();
  for (const row of list(taken, 'Taken')) {
    const ruimte = text(row.ruimte, 'Ruimte'), taak = text(row.taak, 'Taak');
    if (!Object.hasOwn(result, row.status)) throw new Error('Status: kies inbegrepen, uitgesloten of bespreken.');
    const key = `${ruimte.toLocaleLowerCase('nl')}\u0000${taak.toLocaleLowerCase('nl')}`;
    if (seen.has(key)) throw new Error('Dezelfde ruimte en taak staan meer dan eenmaal in de lijst.');
    seen.add(key); result[row.status].push({ruimte, taak});
  }
  return result;
}
export function werkvolgorde({stappen}) {
  const rows = list(stappen, 'Stappen'), byId = new Map();
  for (const row of rows) {
    const id = text(row.id, 'Stap');
    if (byId.has(id)) throw new Error('Elke stap moet een unieke naam hebben.');
    byId.set(id, {...row, id, na: list(row.na ?? [], 'Afhankelijkheden').map(x => text(x, 'Afhankelijkheid'))});
  }
  const result = [], visiting = new Set(), done = new Set();
  function visit(id) {
    if (!byId.has(id)) throw new Error(`Onbekende afhankelijkheid: ${id}`);
    if (visiting.has(id)) throw new Error('De planning bevat een cirkel van afhankelijkheden.');
    if (done.has(id)) return;
    visiting.add(id); byId.get(id).na.forEach(visit); visiting.delete(id); done.add(id); result.push(id);
  }
  byId.forEach((_, id) => visit(id));
  return {volgorde: result, beperking: 'Volgorde op basis van uw invoer; geen kalender, droogtijd of beschikbaarheid.'};
}
