import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { Subscription } from 'rxjs';

import { Plugins } from '@capacitor/core';


export enum PanType {
    True,
    Center,
    Static,
}

export class PanControl {
    private positionSubscription: Subscription;
    private panType: PanType = PanType.True;

    // VR world
    isVirtualWorld: boolean = false;
    private avatarPositionSubscription: Subscription;

    private map: MapboxMap;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService, isVirtualWorld: boolean) {
        this.map = map;

        // VR world (to check type of the game)
        this.isVirtualWorld = isVirtualWorld;

        if (!isVirtualWorld) {
            this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
                position => {
                    if (this.map != undefined && this.panType == PanType.Center) {
                        this.map.setCenter([position.coords.longitude, position.coords.latitude]);
                        // this.map.panTo([position.coords.longitude, position.coords.latitude]);
                    }
                }
            );
        } else {
            // VR world
            this.avatarPositionSubscription = this.geolocationService.avatarGeolocationSubscription.subscribe(
                avatarPosition => {
                    if (this.map != undefined && this.panType == PanType.Center) {
                        this.map.setCenter([parseFloat(avatarPosition["x"]) / 111000, parseFloat(avatarPosition["z"]) / 111200]);
                    }
                }
            );
        }
    }

    public setType(type: PanType): void {
        if (this.map != undefined) {
            this.panType = type;
            this.reset();
            this.update();
        }
    }

    private reset(): void {
        this.map.dragPan.enable();
    }

    private update(): void {
        switch (this.panType) {
            case PanType.True:
                break;
            case PanType.Center:
                this.map.dragPan.disable();
                break;
            case PanType.Static:
                this.map.dragPan.disable();
                break;
        }
    }

    public remove(): void {
        if (!this.isVirtualWorld) {
            this.positionSubscription.unsubscribe();
        } else {
            this.avatarPositionSubscription.unsubscribe();
        }
    }
}