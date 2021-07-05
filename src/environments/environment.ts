// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiURL: "http://192.168.0.87:3000",
  // apiURL: 'http://192.168.0.102:3000',
  apiURL: "https://api.origami.felixerdmann.com",
  // apiURL: "http://localhost:3000",
  // apiURL: 'https://api.ori-gami.org'
  mapboxAccessToken:
    "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA",
  photoQuality: 10,
  // VR world
  initialAvatarLoc: {
    lng:224 / 111000,
    lat:74 / 112000
  },  
  initialAvatarLoc_MirroredVersion: {
    lng:214 / 111000,
    lat:69 / 112000
  },
  VR_Version_A:'https://i.imgur.com/SvU6G4d.png',
  VR_Version_B:'https://i.imgur.com/vRzUK1F.png'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
