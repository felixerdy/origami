import { Component, ChangeDetectorRef } from '@angular/core';
  constructor(private readonly ibeacon: IBeacon, private readonly platform: Platform, private changeRef: ChangeDetectorRef) {
    this.platform.ready().then(() => {
  public stopScannning(): void {
    // stop ranging
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion)
      .then(async () => {
        console.log(`Stopped ranging beacon region:`, this.beaconRegion);
      })
      .catch((error: any) => {
        console.log(`Failed to stop ranging beacon region: `, this.beaconRegion);
      });
  }

            this.changeRef.detectChanges(); // Check for data change to update view Y.Q
          } else {
