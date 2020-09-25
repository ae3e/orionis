![Logo](resources/icon.png)
# Orionis

Navigate a route during an exercise with Fitbit Ionic

Visit url https://gallery.fitbit.com/details/9897b324-9be2-4171-b6bd-f1e978d57298 from your smartphone to install the application (Fitbit app must be already installed).

## User guide

A Strava account is required.
1. Open the Fitbit application
2. In Orionis Settings, logging to Strava (Only the first time), choose a route and then tap the *update* button. The message *Successfully downloaded* should be displayed

![Settings](doc/img/settings.png)

3. Start Orionis on your Fitbit Ionic :

![Main](doc/img/screenshot1.png)

- select the type of activity (Run, Cycling, Hiking) by tapping the cog wheel in the upper left corner and validate

![ExerciceType](doc/img/screenshot3.png)

- Tap the arrow in the bottom right corner to start GPS
- Wait until GPS is found, and you'll be able to start your activity on tapping the arrow in the bottom right corner.

![Start](doc/img/screenshot2.png)

- Tap the pause button in the bottom right corner and then the flag button in the upper right corner when exercise is finished. Exercise can also be paused and resumed using the pause/play button.

![End](doc/img/screenshot7.png)

3 displays are available during exercice : statistics, global map (whole route), local map (500m around you)

![Statistics](doc/img/screenshot6.png) ![GlobalMap](doc/img/screenshot4.png) ![LocalMap](doc/img/screenshot5.png)

**Remarks** :
- Exrcise can start only when GPS is found.
- Route is simplified to have less than 100 points.
 
**Disclaimer** :
I do not make any warranties about completeness, reliability and accuracy of this application. Any action you take upon the use of this app is strictly at your own risk.

## Developer guide
1. Clone repository

2. `env.js.example` file must be renamed `env.js` and modified (adjust Strava's `clientId` and `clientSecret` values).

3. Run command `npx fitbit` then `bi` (`build` and `install`)

### Dev issue
Bug with OS Simulator 0.8.3 : Unable to Interact with Touch Screen
- https://community.fitbit.com/t5/SDK-Development/Fitbit-OS-Simulator/m-p/4487174#M13104
- https://community.fitbit.com/t5/SDK-Development/Unable-to-Interact-with-Touch-Screen-on-Fitbit-Simulator/m-p/4483332#M13072

To solve this issue, I downgraded OS Simulator 0.8.2 (https://simulator-updates.fitbit.com/Fitbit%20OS%20Simulator-latest-0.8.2.exe)
and to avoid auto-update, I set a wrong url in C:\Users\XXX\AppData\Local\Programs\@fitbitsimulator\resources\app-udate.yml

About OS Simulator :
- Update folder : C:\Users\XXX\AppData\Local\@fitbitsimulator-updater
- Installation folder : C:\Users\XXX\AppData\Local\Programs\@fitbitsimulator
- Config and projects fodlers : C:\Users\mangeot-a\AppData\Roaming\Fitbit OS Simulator

## Test
2020-07-02
- Ionic v27.33.1.30
- Fitbit App v3.4.2 (20213455)