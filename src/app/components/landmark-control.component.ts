import { Map as MapboxMap } from "mapbox-gl";


export class LandmarkControl {
    private map: MapboxMap;
    private warningColor: string;
    private secondaryColor: string;
    private dangerColor: string;


    constructor(map: MapboxMap) {
        this.map = map;
        this.warningColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning');
        this.secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
        this.dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

    }

    public setLandmark(landmark: any) {
        if (this.map.getLayer('landmarksLayerPolygon')) {
            this.map.removeLayer('landmarksLayerPolygon')
        }
        if (this.map.getLayer('landmarksLayerLine')) {
            this.map.removeLayer('landmarksLayer')
        }
        if (this.map.getSource('landmarksLayerLine')) {
            this.map.removeSource('landmarksSource')
        }

        this.map.addSource('landmarksSource', {
            type: "geojson",
            data: landmark
        })
        this.map.addLayer({
            id: "landmarksLayerPolygon",
            type: "fill-extrusion",
            source: 'landmarksSource',
            paint: {
                "fill-extrusion-color": this.dangerColor,
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 50,
            }
        });
        this.map.addLayer({
            id: "landmarksLayerLine",
            type: "line",
            source: 'landmarksSource',
            paint: {
                "line-color": this.dangerColor,
                "line-opacity": 0.5,
                "line-width": 5,
            }
        });
    }

    setQTLandmark(landmark: any) {
        if (this.map.getLayer('landmarks-qt-map-layer')) {
            this.map.removeLayer('landmarks-qt-map-layer')
        }
        if (this.map.getSource('landmarks-qt-map-source')) {
            this.map.removeSource('landmarks-qt-map-source')
        }

        this.map.addSource('landmarks-qt-map-source', {
            type: "geojson",
            data: landmark
        })
        this.map.addLayer({
            id: "landmarks-qt-map-layer",
            type: "fill-extrusion",
            source: 'landmarks-qt-map-source',
            paint: {
                "fill-extrusion-color": this.secondaryColor,
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": 20
            }
        });
    }

    public remove(): void {
        if (this.map.getLayer('landmarksLayerPolygon')) {
            this.map.removeLayer('landmarksLayerPolygon')
        }
        if (this.map.getLayer('landmarksLayerLine')) {
            this.map.removeLayer('landmarksLayer')
        }
        if (this.map.getSource('landmarksLayerLine')) {
            this.map.removeSource('landmarksSource')
        }

        if (this.map.getLayer('landmarks-qt-map-layer')) {
            this.map.removeLayer('landmarks-qt-map-layer')
        }
        if (this.map.getSource('landmarks-qt-map-source')) {
            this.map.removeSource('landmarks-qt-map-source')
        }
    }
}