# [Odkaz na hru](https://kaj-sytnyart-36dd05.pages.fel.cvut.cz/)

# Coin Town

**Coin town** je primitivní hra-simulace kde hráč postupně staví budovy tři typu a snaží se maximalizovat počet populace. Typy budov jsou – **residence**, **obchody** a **továrny**. Obchody a továrny jsou místa kde resident může pracovat. Továrny vyrábí produkt, který prodají obchodům, které ho prodají residentům. Resident chce za den, jak dostat zaplaceno, tak i něco nakoupit, obchod a továrna chtějí zaplatit pracovníkům za práci a prodat nějaké produkty. Pokud se nepovedou obě možnosti, budou nespokojení a mohou město opustit – zmizí.
Hráč dostava zaplaceno denně podle počtu postavených budov.

## Cíl projektu

Cílem projektu je vytvořit hru, která umožní na platně stavit věci podle výběru a interagovat s daným plátnem – umožnit zoom a přetahování myší. Stavení je omezeno velikosti města, nemožnosti stavit uzly daleko od sebe anebo na sebe. Hra má svou rychlost běhu – 4 kroky do sekundy, ale dá se zrychlit tlačítkem. Rendering běží plynule. Hra má od začátku vypnutou hudbu na pozadí, ale da se zapínat a vypínat. Existuje možnost uložení a načtení stavu her – vybudovaných městeček. Uložení je provedeno pomoci LocalStorage.

## Postup

- **Příprava struktury prvků:** Připraveno plátno (canvas) a tlačítka pro ovládání hry.
- **Implementace plátna:** Vytvořeno plátno pro zobrazení uzlů.
- **Přidání interaktivity:** Implementována funkce pro drag and drop uzlů a validace platnosti umístění.
- **Rozdělení logiky:** Oddělena logika update hry a rendering plátna pro efektivní správu stavu a zobrazení.
- **Herní logika uzlů:** Implementována logika pro umisťování a interakce mezi uzly.
- **Ukládání herního stavu:** Přidáno ukládání herního stavu pro pokračování hry.
- **Vylepšení:** Přidání menších funkcí, jako tlačítka pro hudbu a nápovědu.
- **Refactor:** změny kódu, dekompozice, zapouzdření
- **Pokročilé funkce:** Vylepšení uložení stavu her, jejich import a export, také reagování na offline stav uživatele

## Popis funkčnosti

**Budovy:**

- Jsou dostupné, pokud hráč má na ně dostatek minci
- Dají se umisťovat v rámci města, při rozmístění zobrazuji zóny vlivu – interakce mezi budovami
- Při úspěšném rozmístěni budovy se cena na daný typ zvyšuje

**Canvas:**

- Dá se přetahovat pomoci myší
- Dá se měnit (viditelná) velikost jak myší, tak tlačítky
- Zobrazuje zónu města
- Zobrazí animaci budov při zisku minci nebo produktu

**Start / speed:**

- Start/Stop tlačítko startuje nebo pozastaví běh simulace
- Reaguje na “Space” neboli mezerník
- Speed přepíná mezi rychlostmi 1, 2 a 4.

**Otazníček (tlačítko):**

- Zobrazí nápovědu ke hře
- Zobrazení na najeti i na klik, pak klikem schovat

**Značka vypnutého zvuku:**

- Ovládací prvek na mute/unmute hudby v pozadí
- (defaultně je na hlasitosti 0.2 ať nezabiji uši)

**Burger button / Menu:**

- Uložit hru, kdy se pokaždé musí vybrat do kterého slotu nyní uložit
- Při uložení do prázdného slotu je hráč vyzván k pojmenování města. U dané výzvy je tlačítko náhodného názvu pomoci API
- Načíst hru – povolí vybrat slot, ze kterého má načíst uložený stav hry. Prázdny slot nic nenačte – vypíše hlášku.
- Restart hry – neřeší aktuální hru, vytvoří novou čistou verzí se stejným nastavením

**offline stav:**

- Hra naposlouchá zda uživatel je online
- Zobrazí identifikaci offline stavu pomocí červeného kolečka
- Nepovolí možnost náhodné generace názvu města při ukládání nové hry

**Import a export:**

- V pohledu save slotu hry jsou tlačítka pro export či import json souborů
- Export hned vytvoří a stáhne json soubor uživateli
- Import povolí uživateli vybrat soubor a nahrát ho do save slotu
