# **Dokumentace a návod k použití - AlgoPaint**  
*Jednoduchý grafický editor v Reactu*  

## **1. Úvod**  
SimplePaint je jednoduchý grafický editor napsaný v Reactu, který umožňuje kreslit různé tvary pomocí algoritmů.

---

## **2. Funkce**  
- **Nástroje pro kreslení:**  
  - 🖊️ **Tužka** – klasické kreslení pixel po pixelu  
  - 🧽 **Guma** – mazání (3× větší než tužka)  
  - 📏 **Čára** – kreslení přímky  
  - ⬛ **Obdélník** – kreslení obdélníku  
  - ⭕ **Kružnice** – kreslení kružnice (Bresenhamův algoritmus)  
  - 🔺 **Polygon** – kreslení mnohoúhelníku (dvojklikem dokončíte)  
  - 🎨 **Vyplňování (Flood Fill)** – vyplní uzavřenou oblast barvou  

- **Další možnosti:**  
  - 🖌️ **Nastavení barvy a tloušťky štětce**  
  - 🏁 **Přerušovaná čára**  
  - 📐 **Snapping na 45° úhly** (pro čáry, obdélníky a kružnice)  
  - 🗑️ **Vymazání plátna**  

---

## **3. Návod k použití**  

### **Základní ovládání**  
1. **Výběr nástroje** – Rozbalovací menu v horní části.  
2. **Kreslení:**  
   - **Tužka/Guma:** Klikni a táhni myší.  
   - **Čára/Obdélník/Kružnice:** Klikni (začátek), táhni (náhled) a pusť (potvrzení).  
   - **Polygon:** Klikávej pro přidávání vrcholů, **dvojklikem** dokončíš.  
   - **Flood Fill:** Klikni na oblast, kterou chceš vyplnit.  
3. **Vymazání plátna:** Tlačítko **Clear**.  

### **Pokročilé nastavení**  
- **Barva:** Mění se pomocí color pickeru.  
- **Tloušťka štětce:** Posuvník vedle barvy (1–10 px).  
- **Přerušovaná čára:** Zaškrtni *Dashed Lines*.  
- **Snapping na 45°:** Zaškrtni *Enable 45° Snapping* (užitečné pro přesné čáry).  

---

## **4. Technické detaily**  
- **Použité algoritmy:**  
  - **Flood Fill** – vyplňuje oblast (rekurzivní algoritmus).  
  - **Bresenhamův algoritmus** – pro vykreslení kružnice.  
- **React hooks:** `useRef`, `useState`, `useEffect`.  
- **Canvas:** Dva překrývající se canvasy (jeden pro finální kresbu, druhý pro náhled).  

---

## **5. Tipy pro vylepšení**  
- Přidání **undo/redo** (např. pomocí ukládání stavu canvasu).  
- Ukládání obrázků (**PNG/JPEG export**).  
- Vylepšení Flood Fill (optimalizace pro větší plochy).  

---

*Vytvořeno jako školní projekt – (c) 2025*