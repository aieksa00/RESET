Implementacija platforme RESET
Ovo poglavlje sistematski prikazuje implementaciju platforme RESET kroz tri međusobno povezane dimenzije: (1.1) visok nivo arhitekture koji definiše komponente i njihove interakcije, (1.2) implementacione detalje koji pokrivaju kodnu bazu, smart‑contracte, infrastrukturu i testne procedure, i (1.3) UI/UX segment koji razmatra dizajnerske odluke i korisničke tokove. Cilj poglavlja je pružiti čitljiv i ponovljiv prikaz tehničkih rešenja, argumentaciju za ključne arhitekturne izbore i praktične smernice za održavanje i dalje razvijanje sistema.

1.1 High‑level arhitektura platforme

Platforma RESET implementirana je kao potpuno decentralizovano rešenje koje se oslanja isključivo na blockchain infrastrukturu, bez tradicionalnog backend sloja. Arhitektura se sastoji od tri ključne komponente: smart ugovora koji čine jezgro sistema, The Graph protokola za indeksiranje podataka, i web interfejsa koji omogućava interakciju sa platformom.

Smart ugovori predstavljaju fundamentalni sloj platforme koji enkapsulira kompletnu poslovnu logiku i skladištenje podataka. Svi kritični podaci - od prijavljenih incidenata, preko ponuda za rešavanje sporova, do kriptovanih poruka između učesnika - čuvaju se direktno u blockchain transakcijama. Ovakav pristup garantuje potpunu transparentnost i nepromenljivost istorije interakcija, što je od posebnog značaja za uspostavljanje poverenja u kontekstu sajber incidenata.

Za efikasno pretraživanje i pristup podacima, platforma koristi The Graph protokol koji indeksira blockchain događaje kroz GraphQL API. Ovo rešenje eliminiše potrebu za zasebnim backend servisima, istovremeno obezbeđujući performantno preuzimanje podataka za frontend aplikaciju. Subgraph definiše precizne sheme za mapiranje on-chain događaja u strukturirane podatke, omogućavajući kompleksne upite nad istorijom incidenata i komunikacija.

Frontend aplikacija služi kao interfejs ka blockchain funkcionalnostima, pri čemu autentifikacija korisnika počiva isključivo na kriptografskim novčanicima (wallets). Nakon povezivanja novčanika, sistem automatski identifikuje ulogu korisnika upoređivanjem adrese sa registrovanim incidentima - ako se adresa podudara sa "hack-ovanom" ili "hakerskom" adresom, korisniku se otključavaju specifične funkcionalnosti:

- Pregled i slanje kriptovanih poruka relevantnim stranama
- Kreiranje ili prihvatanje ponuda za povraćaj sredstava
- Praćenje statusa pregovora i verifikacija izvršenja dogovora

Ovakva arhitektura eliminiše potrebu za centralnim autoritetom ili posrednikom, dok istovremeno održava visok nivo sigurnosti i privatnosti kroz end-to-end enkripciju poruka i striktnu kontrolu pristupa na nivou smart ugovora. Sva validacija prava pristupa i poslovna logika izvršava se kroz determinističke funkcije na lancu, čineći sistem otpornim na manipulaciju i pogodnim za nezavisnu verifikaciju.

Smart ugovori su dizajnirani modularno, sa jasnom separacijom odgovornosti:
- Registracija i upravljanje incidentima
- Sistem za razmenu kriptovanih poruka
- Upravljanje ponudama i njihovim statusima
- Verifikacija izvršenja dogovora

Ova arhitekturna odluka da se platform implementira kao potpuno on-chain rešenje donosi nekoliko ključnih prednosti:
- Eliminacija rizika povezanih sa centralizovanom infrastrukturom
- Garantovana dostupnost i nepromenljivost istorijskih podataka
- Transparentna verifikacija svih interakcija
- Prirodna otpornost na cenzuru i manipulaciju

1.2 Implementacioni detalji

Smart‑contract sloj: Implementacija obuhvata skup smart‑contracta koji enkapsuliraju ekonomska pravila, mehanizme za razmenu vrednosti i emitovanje događaja. Kontrakti su dizajnirani prema principima modularnosti i minimalne privilegije; svaka funkcija ima jasno određen stepen pristupa i gas optimizaciju. Verzije kontrakta su verzionisane i pokrivene unit i integracionim testovima.
Deploy i CI/CD: Proces deploy‑a je automatizovan skriptama i CI pipeline‑ima koji obuhvataju statičku analizu, unit testove, integracione testove na lokalnim mrežama i simulaciju deploy‑a na testnet pre produkcije. Automatski koraci uključuju verifikaciju izvornog koda, automatsko generisanje artefakata (ABI, interfejsi) i beleženje verzija deploy‑a u artefakt repozitorijumu.
Backend i indeksiranje: Podaci sa blockchain‑a se prikupljaju i indeksiraju pomoću subgraph/indeks servisa koji omogućavaju efikasno filtriranje i agregaciju događaja. Poslovna logika koja zahteva brzo pretraživanje ili kompleksne upite implementirana je u zasebnim mikroservisima sa jasno definisanim API‑jem (GraphQL/REST). Logovanje i monitoring obuhvata metrika performansi, health‑check‑eve i alarme za anomalije.
Testiranje i verifikacija: Testni pristup kombinuje unit testove (kontrakti, backend logika), simulacione testove (lokalne blockchain mreže, fork‑ovane mreže) i E2E testove za korisničke tokove. Dodatno, koristi se formalna ili semi‑formalna verifikacija kritičnih komponenti gde je to opravdano zbog ekonomskog rizika. Testni primeri su reproducibilni i deo su CI procesa.
Bezbednost i upravljanje sekretima: Implementacija uključuje bezbedne prakse za upravljanje ključevima i sekretima (HSM/keystore, CI secret management), reviziju pristupa (least privilege) i redovne sigurnosne audite. Mehanizmi za otkrivanje i oporavak od grešaka su definisani operativnim procedurama i rollback planovima.
1.3 UI/UX

Principi dizajna: UI/UX segment se vodi principima jasnoće, minimalnog kognitivnog opterećenja i transparentnosti u kontekstu blockchain interakcija. Korisnicima se predstavljaju koncizne informacije o statusu transakcija, troškovima (gas) i mogućim rizicima, uz eksplicitne potvrde i fallback mehanizme.
Arhitektura frontenda: Frontend je modularan, baziran na komponentnom pristupu koji omogućava ponovno korišćenje vizuelnih i funkcionalnih elemenata. Stanja koja zahtevaju poverenje prikazuju se kroz verifikovane podatke iz indeksa/subgraph‑a, dok kritične akcije prelaze kroz višestepene dijaloge i, gde je potrebno, out‑of‑band verifikaciju.
Korisnički tokovi i pristupačnost: Primarni tokovi (kreiranje, verifikacija, izvršenje transakcija, pregled istorije) su mapirani tako da minimiziraju broj koraka i grešaka korisnika. Implementirane su smernice za pristupačnost (WCAG) i podrška za različite uređaje i rezolucije. UX odluke su dokumentovane uz motivaciju i očekivani uticaj na performanse i konverziju.
Privatnost i sigurnost u UI: Dobijeni podaci i interakcije su minimalno neophodni za funkcionalnost; osetljivi podaci se ne čuvaju na klijentskoj strani bez enkripcije. Interfejs jasno informiše korisnika o dozvolama i prenosu podataka ka eksternim servisima, uz mogućnosti za revokaciju i audit putanju.
Zaključak

Implementacija platforme RESET balansira između sigurnosti, transparentnosti i upotrebljivosti. Predložena arhitektura i implementacione prakse omogućavaju dalji razvoj i održavanje sistema uz mogućnost revizije i audita. Preporučuje se kontinuirana automatizacija testova, redovne sigurnosne provere i iterativna evaluacija UX odluka u realnim uslovima korišćenja.