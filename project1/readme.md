✅ 1. "Smart Todo App"
🧠 Znalosti:
DOM manipulácia

Factory / Constructor function

LocalStorage (perzistencia)

Event handling

Array metódy (.map, .filter, .forEach)

Error handling + try/catch

💡 Popis:
Malá to-do appka s možnosťou:

pridávať/mazať úlohy

označiť ako hotové

filtrovať podľa stavu (všetky / dokončené / nedokončené)

validácia prázdneho vstupu

uloženie do localStorage

🔧 ZÁKLADNÉ VECI:
✅ 1.1 HTML štruktúra (kostra)
Musíš si pripraviť jednoduché HTML:

<input> pre zadávanie úloh

<button> na pridanie úlohy

<ul> alebo <div> kde sa budú zobrazovať úlohy

prepínače / filtre (všetky, hotové, nehotové)

✅ 1.2 Základné CSS (stačí jednoduché)
Použiteľné UI: oddeľ úlohy vizuálne, štýl pre hotové úlohy (napr. prečiarknutý text)

🧠 2. Logika aplikácie (čo sa bude diať)
Funkcionalita krok za krokom:
Pridanie úlohy

Po kliknutí na „Pridať“ sa úloha zobrazí v zozname

Validácia: ak je prázdne pole, zobrazí sa chyba (napr. alert)

Uloženie úloh do localStorage

Každá zmena (pridanie/odstránenie/označenie) sa uloží do localStorage

Pri načítaní stránky sa načítajú uložené úlohy

Označenie úlohy ako dokončenej

Kliknutím na checkbox alebo tlačidlo sa úloha označí ako hotová

Mazanie úlohy

Tlačidlo „vymazať“ vedľa každej úlohy

Filter úloh

Zobraziť len „všetky / hotové / nehotové“

🔨 3. Technické zručnosti, ktoré si zopakuješ
Funkcia	Čo si na tom precvičíš
addEventListener()	event handling
createElement, appendChild	DOM manipulácia
localStorage.setItem/getItem	perzistencia dát
.filter(), .map()	práca s poliami
Factory alebo Constructor function	vytváranie úloh ako objektov
try/catch	error handling pri práci s localStorage

🔁 4. Odporúčaný postup
Vytvor HTML a CSS základ

Vytvor funkciu na vytvorenie úlohy (factory / constructor)

Zobraz úlohy v DOM – dynamicky

Pridaj event listener na pridávanie úloh

Pridaj možnosť označiť úlohu ako hotovú

Pridaj localStorage: načítanie a ukladanie

Pridaj filtre (všetky / hotové / nehotové)

Pridaj validáciu a error handling

