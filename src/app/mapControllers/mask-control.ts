import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { Subscription } from 'rxjs';
import circle from '@turf/circle';
import mask from '@turf/mask';


export enum MaskType {
    Enabled,
    Disabled
}


export class MaskControl {
    private positionSubscription: Subscription;
    private maskType: MaskType = MaskType.Disabled;

    // VR world
    isVirtualWorld: boolean = false;
    private avatarPositionSubscription: Subscription;

    private map: MapboxMap;

    private isInitalized = false;

    private coords: number[];

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService, isVirtualWorld: boolean) {
        this.map = map;

        // VR world (to check game type)
        this.isVirtualWorld = isVirtualWorld;

        if (!isVirtualWorld) {
            this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
                position => {
                this.coords = [position.coords.longitude, position.coords.latitude];
            });
        } else {
            // VR world
            this.avatarPositionSubscription = this.geolocationService.avatarGeolocationSubscription.subscribe(
                avatarPosition => {
                this.coords = [parseFloat(avatarPosition["x"]) / 111000, parseFloat(avatarPosition["z"]) / 111200];
            });
        }
    }

    public setType(type: MaskType): void {
        if (this.map != undefined) {
            this.maskType = type;
            this.reset();
            this.update();
        }
    }

    public addLayer(val: number) {
        // outer circle
        let ocCenter = [this.coords[0], this.coords[1]];
        let ocRadius = 1500;
        let ocPptions = { steps: 30, units: 'kilometers'};
        let outerCircle = circle(ocCenter, ocRadius, ocPptions);

        // inner circle
        let icCenter = [this.coords[0], this.coords[1]];
        let icRadius = val/1000; // to get it in meter
        let icOptions = { steps: 30, units: 'kilometers' };
        let innerCircle = circle(icCenter, icRadius, icOptions);

        let masked = mask(innerCircle, outerCircle);

        this.map.addSource('circle-mask', {
            type: 'geojson',
            data: masked
        });

        this.map.addLayer({
            id: 'circle-mask',
            source: 'circle-mask',
            type: 'fill',
            paint: {
                'fill-color': '#808080',
                'fill-opacity': 0.8
            }
        });

        this.map.setLayoutProperty('circle-mask', 'visibility', 'none');
        this.isInitalized = true;
        this.update();
    }

    toggle() {
        if (this.map.getLayoutProperty('circle-mask', 'visibility') == 'none') {
            this.map.setLayoutProperty('circle-mask', 'visibility', 'visible');
        } else {
            this.map.setLayoutProperty('circle-mask', 'visibility', 'none');
        }

    }

    private reset(): void {
        if (this.map.getLayer('circle-mask') && this.map.getLayoutProperty('circle-mask', 'visibility') == 'visible') {
            this.map.setLayoutProperty('circle-mask', 'visibility', 'none');
        }
    }

    private update(): void {
        if (!this.isInitalized) {
            return;
        }
        switch (this.maskType) {
            case MaskType.Disabled:
                this.reset();
                break;
            case MaskType.Enabled:
                if (this.map.getLayoutProperty('circle-mask', 'visibility') == 'none') {
                    this.map.setLayoutProperty('circle-mask', 'visibility', 'visible');
                }
                break;
        }
    }

    public remove(): void {
        this.reset();

        if (!this.isVirtualWorld) {
            this.positionSubscription.unsubscribe();
        } else {
            this.avatarPositionSubscription.unsubscribe();
        }
    }
}