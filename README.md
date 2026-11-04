# Cost Guide Open Tools

Publieke projectdocumentatie en vier controleerbare JavaScript-functies voor woningonderhoud.

Geen marktprijzen, automatische btw-keuze, klantgegevens, tracking, externe pakketten of boekingsformulieren.

## Documentatie en voorbeelden

- [Oppervlakte van vlakken en openingen narekenen](docs/stucwerk-rekenregels.html) — `nettoOppervlakte`
- [Offertebedragen per regel optellen met expliciete btw-invoer](docs/schilderwerk-rekenregels.html) — `offerteTotaal`
- [Een werkvolgorde controleren op ontbrekende stappen en cirkels](docs/werkvolgorde-rekenregels.html) — `werkvolgorde`
- [Schoonmaaktaken verdelen in inbegrepen, uitgesloten en te bespreken](docs/schoonmaak-rekenregels.html) — `scopeOverzicht`

## Tests

Node.js 20 of nieuwer:

```sh
node --test
```

De demonstraties draaien lokaal in de browser; ingevoerde gegevens worden niet verzonden of bewaard. Documentatie: `docs/`. De ingebouwde voorbeelden zijn fictief. De broncode wordt openbaar aangeboden ter inspectie; dit project bevat geen aparte open-sourcelicentie.

Versie 1.0 · 4 november 2026. Eigen project van Cost Guide Nederland, zonder endorsement door de hostingprovider.
