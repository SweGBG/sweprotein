# SweProtein – scenfilmen i MiniMax H3

**Status: klar.** `public/video/sweprotein-scene.mp4` (32 s, 1344x768) är gjord av de fyra klippen nedan.

Sajten fungerar direkt: utan film spelas scrollscenen med fyra riktiga foton
(Unsplash + flaskan från Figma) som zoomar och tonar över i varandra. När filmen finns i
`public/video/sweprotein-scene.mp4` byter sajten automatiskt till den, och scrollen
spolar filmen fram och tillbaka.

## Klippen (16:9, 0.5 MP = 960x544, 8 s, låst kamera)

| # | Workflow | Vad som händer | Startbild |
|---|---|---|---|
| 1 | SweProtein_01_Hero | Jordgubben lyfter från ytan och svävar, shaken stiger | Unsplash-fotot `sweprotein/sweprotein_h3_start.png` (redan inställd) |
| 2 | SweProtein_02_Fall | Jordgubbar, choklad, havre och blåbär plaskar ner i shaken | sista bildrutan från 1 |
| 3 | SweProtein_03_Swirl | Mjölk virvlar in, shaken fyller bilden | sista bildrutan från 2 |
| 4 | SweProtein_04_Bottle | Flaskan stiger upp ur shaken och landar bland jordgubbarna | sista bildrutan från 3, **slutbild** = Figma-flaskan (redan kopplad till last_frame) |

Kör dem i ordning. Varje klipp tar ungefär 25 min på 3060:an.
Klipp 2–4: Ctrl+B på noden **Startbild** och välj `..._lastframe` från klippet innan.

## Efteråt

1. Kör `join-scene.bat` i `ComfyUI\output\video` (kräver ffmpeg),
   eller skicka de fyra klippen till Claude så klipps de ihop.
2. Lägg `sweprotein-scene.mp4` och `sweprotein-poster.jpg` i `public/video/`.
3. `npm run dev` och scrolla.

Klipp 4 landar på Figma-flaskan via last_frame, så etiketten blir rätt i sista bilden.

## Bilderna

- `ComfyUI\input\sweprotein\` har originalen (Unsplash + `sweprotein_bottle.png` från Figma)
  och H3-start/slutbilderna i 960x544.
- Sajtens versioner ligger i `public/img/` (webp). Krediter finns i sidfoten.
