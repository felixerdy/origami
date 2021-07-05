import { Map as MapboxMap } from 'mapbox-gl';
import { Subscription } from 'rxjs';
import { OrigamiGeolocationService } from '../services/origami-geolocation.service';
import { OrigamiOrientationService } from '../services/origami-orientation.service';


// VR world
import { environment } from 'src/environments/environment';

export enum ViewDirectionType {
    None,
    Continuous,
    Button,
    TaskStart
}

export class ViewDirectionControl {
    private deviceOrientationSubscription: Subscription;
    private positionSubscription: Subscription;
    private viewDirectionType: ViewDirectionType = ViewDirectionType.None;

    private map: MapboxMap;

    private isInitalized = false;

    // VR world
    isVirtualWorld: boolean = false;
    initialAvatarLoc: any;
    private avatarPositionSubscription: Subscription;
    private avatarOrientationSubscription: Subscription;

    constructor(map: MapboxMap, private geolocationService: OrigamiGeolocationService, private orientationService: OrigamiOrientationService,
        isVirtualWorld: boolean, initialAvatarLoc: any) {
        this.map = map;
        this.isVirtualWorld = isVirtualWorld;
        this.initialAvatarLoc = initialAvatarLoc;

        if (!isVirtualWorld) {
            this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
                position => {
                    if (this.map != undefined && this.isInitalized) {
                        this.map.getSource('viewDirection').setData({
                            type: 'Point',
                            coordinates: [position.coords.longitude, position.coords.latitude]
                        });
                    }
                }
            );

            this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe((heading: number) => {
                if (this.map.getLayer('viewDirection')) {
                    this.map.setLayoutProperty(
                        'viewDirection',
                        'icon-rotate',
                        heading - this.map.getBearing()
                    );
                }
            });

        } else {
            // VR world
            this.avatarPositionSubscription = this.geolocationService.avatarGeolocationSubscription.subscribe(
                avatarPosition => {
                    if (this.map != undefined && this.isInitalized) {
                        this.map.getSource('viewDirection').setData({
                            type: 'Point',
                            coordinates: [parseFloat(avatarPosition["x"]) / 111000, parseFloat(avatarPosition["z"]) / 111200]
                        });
                    }
                });

                this.avatarOrientationSubscription = this.orientationService.avatarOrientationSubscription.subscribe(avatarHeading => {
                    if (this.map.getLayer('viewDirection')) {
                        this.map.setLayoutProperty(
                            'viewDirection',
                            'icon-rotate',
                            avatarHeading - this.map.getBearing()
                        );
                    }
                });
        }

        this.map.loadImage(
            '/assets/icons/directionv2.png',
            (error, image) => {
                if (error) throw error;

                this.map.addImage('view-direction', image);

                this.map.addSource('viewDirection', {
                    type: 'geojson',
                    data: {
                        type: 'Point',
                        coordinates: (this.isVirtualWorld ? [this.initialAvatarLoc.lng, this.initialAvatarLoc.lat] : [0, 0]) // VR World: update the inititial avatar position
                    }
                });
                this.map.addLayer({
                    id: 'viewDirection',
                    source: 'viewDirection',
                    type: 'symbol',
                    layout: {
                        'icon-image': 'view-direction',
                        'icon-size': 0.65,
                        'icon-offset': [0, -8]
                    }
                });
                this.map.setLayoutProperty('viewDirection', 'visibility', 'none');
                this.isInitalized = true;
                this.update();
            });
    }

    public setType(type: ViewDirectionType): void {
        if (this.map != undefined) {
            this.viewDirectionType = type;
            this.reset();
            this.update();
        }
    }

    public toggle() {
        if (this.map.getLayoutProperty('viewDirection', 'visibility') == 'visible') {
            this.setType(ViewDirectionType.None);
        } else {
            this.setType(ViewDirectionType.Continuous);
        }
    }


    private reset(): void {
        if (this.map.getLayer('viewDirection') && this.map.getLayoutProperty('viewDirection', 'visibility') == 'visible') {
            this.map.setLayoutProperty('viewDirection', 'visibility', 'none');
        }

    }

    private update(): void {
        if (!this.isInitalized) {
            return;
        }
        switch (this.viewDirectionType) {
            case ViewDirectionType.None:
                this.reset();
                break;
            case ViewDirectionType.Continuous:
                if (this.map.getLayoutProperty('viewDirection', 'visibility') == 'none')
                    this.map.setLayoutProperty('viewDirection', 'visibility', 'visible');

                break;
            case ViewDirectionType.Button:
                // TODO: implement
                break;
            case ViewDirectionType.TaskStart:
                if (this.map.getLayoutProperty('viewDirection', 'visibility') == 'none')
                    this.map.setLayoutProperty('viewDirection', 'visibility', 'visible');
                setInterval(() => {
                    this.map.setLayoutProperty('viewDirection', 'visibility', 'none');
                }, 10000);
                break;
        }
    }

    public remove(): void {
        this.reset();

        if (!this.isVirtualWorld) {
            this.positionSubscription.unsubscribe();
            if (this.deviceOrientationSubscription != undefined) {
                this.deviceOrientationSubscription.unsubscribe();
            }
        } else {
            this.avatarPositionSubscription.unsubscribe();
            if (this.avatarOrientationSubscription != undefined) {
                this.avatarOrientationSubscription.unsubscribe();
            }
        }
    }
}