@echo off
REM Klipper ihop de fyra H3-klippen till en scrollvanlig film for SweProtein.
REM Kor fran mappen dar klippen ligger (ComfyUI\output\video). Kraver ffmpeg i PATH.
REM Resultat: sweprotein-scene.mp4 och sweprotein-poster.jpg -> lagg dem i sweprotein\public\video\

(
  echo file 'SweProtein_01_Hero_00001.mp4'
  echo file 'SweProtein_02_Fall_00001.mp4'
  echo file 'SweProtein_03_Swirl_00001.mp4'
  echo file 'SweProtein_04_Bottle_00001.mp4'
) > sweprotein-list.txt

REM -g 6: en nyckelbildruta var sjatte bild, sa att filmen gar mjukt att spola fram och tillbaka med scrollen.
ffmpeg -y -f concat -safe 0 -i sweprotein-list.txt -an -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -g 6 -keyint_min 6 -movflags +faststart sweprotein-scene.mp4
ffmpeg -y -i sweprotein-scene.mp4 -frames:v 1 -q:v 3 sweprotein-poster.jpg
del sweprotein-list.txt
echo Klart: sweprotein-scene.mp4 och sweprotein-poster.jpg
pause
