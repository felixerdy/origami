import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    let dLon = this.deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c * 1000; // Distance in km
    return d; // distance in m
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Converts from radians to degrees.
  toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  bearing(startLat, startLng, destLat, destLng) {
    startLat = this.deg2rad(startLat);
    startLng = this.deg2rad(startLng);
    destLat = this.deg2rad(destLat);
    destLng = this.deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    const brngDeg = this.toDegrees(brng);
    return (brngDeg + 360) % 360;
  }

  _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> =>
    JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`)
}
