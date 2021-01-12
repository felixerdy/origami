import { Map as MapboxMap } from 'mapbox-gl';
import { OrigamiGeolocationService } from '../../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { Task } from '../../models/task';
import { AnswerType, QuestionType } from '../../models/types';
import { HelperService } from '../../services/helper.service';
import { PlayingGamePage } from '../../pages/play-game/playing-game/playing-game.page';
import { ToastController } from '@ionic/angular';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { TrackerService } from '../../services/tracker.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Plugins, Capacitor, GeolocationPosition } from '@capacitor/core';
import centroid from '@turf/centroid'
import { OrigamiOrientationService } from 'src/app/services/origami-orientation.service';


enum FeedbackType {
    Correct,
    Wrong,
    TryAgain,
    Saved,
    Success
}

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss'],
    inputs: []
})
export class FeedbackComponent {
    private positionSubscription: Subscription;
    private task: Task;
    private lastKnownPosition: GeolocationPosition
    private Math: Math = Math;
    private audioPlayer: HTMLAudioElement = new Audio();

    showFeedback = false;
    private feedback: any = {
        text: '',
        icon: '',
        solution: '',
        img: '',
        hint: ''
    }
    private feedbackRetry = false;

    private map: any;
    private geolocationService: OrigamiGeolocationService
    private helperService: HelperService
    private toastController: ToastController
    private trackerService: TrackerService
    private playingGamePage: PlayingGamePage

    private feedbackDuration = 2000;
    deviceOrientationSubscription: any;
    private direction: number;
    successColor: string;

    private DIRECTION_TRESHOLD = 22.5

    constructor(private orientationService: OrigamiOrientationService, private changeDetectorRef: ChangeDetectorRef) { }

    init(map: any, geolocationService: OrigamiGeolocationService, helperService: HelperService, toastController: ToastController, trackerService: TrackerService, playingGamePage: PlayingGamePage) {
        this.map = map
        this.geolocationService = geolocationService
        this.helperService = helperService
        this.toastController = toastController
        this.trackerService = trackerService
        this.playingGamePage = playingGamePage

        this.successColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-success');



        this.map.loadImage(
            '/assets/icons/position-solution.png',
            (error, image) => {
                if (error) throw error;

                this.map.addImage('geolocate-solution', image);
            })

        this.map.loadImage(
            '/assets/icons/directionv2-solution.png',
            (error, image) => {
                if (error) throw error;

                this.map.addImage('direction-solution', image);
            })

        this.audioPlayer.src = 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3'

        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe((position: GeolocationPosition) => {
            this.lastKnownPosition = position;

            if (this.task && !PlayingGamePage.showSuccess) {
                if (this.task.answer.type == AnswerType.POSITION) {

                    const waypoint = this.task.answer.position.geometry.coordinates;

                    if (this.userDidArrive(waypoint) && !this.task.settings.confirmation && !this.showFeedback) {
                        this.onWaypointReached();
                    }
                }
            }
        });
        this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe((heading: number) => {
            this.direction = heading
        })
    }

    public setTask(task: Task) {
        this.dismissFeedback()
        this.task = task
    }

    public async setAnswer({
        selectedPhoto,
        isCorrectPhotoSelected,
        selectedChoice,
        isCorrectChoiceSelected,
        photo,
        photoURL,
        directionBearing,
        compassHeading,
        clickDirection,
        numberInput,
        textInput
    }) {
        let isCorrect = true;
        let answer: any = {}

        if (this.task.answer.type == AnswerType.POSITION) {
            const waypoint = this.task.answer.position.geometry.coordinates;
            const arrived = this.userDidArrive(waypoint);
            answer = {
                target: waypoint,
                position: this.lastKnownPosition,
                distance: this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude),
                correct: arrived
            }
            isCorrect = arrived
            if (!arrived) {
                this.initFeedback(false)
            } else {
                this.onWaypointReached();
            }
        }

        if (this.task.type == 'theme-loc') {
            if (this.map.getSource('marker-point')) {
                const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
                const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
                isCorrect = distance < PlayingGamePage.triggerTreshold;
                answer = {
                    clickPosition,
                    distance,
                    correct: isCorrect
                }

                this.initFeedback(distance < PlayingGamePage.triggerTreshold, { distance, clickPosition })
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte setze zuerst deine Position',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();

                isCorrect = false;
                answer = {
                    clickPosition: undefined,
                    distance: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
            if (selectedPhoto != null) {
                this.initFeedback(isCorrectPhotoSelected);
                isCorrect = isCorrectPhotoSelected
                answer = {
                    selectedPhoto,
                    correct: isCorrect
                }
                if (isCorrectPhotoSelected) {
                    isCorrectPhotoSelected = null;
                    selectedPhoto = null;
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte wähle zuerst ein Foto',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    selectedPhoto: null,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
            if (selectedChoice != null) {
                this.initFeedback(isCorrectChoiceSelected);
                isCorrect = isCorrectChoiceSelected
                answer = {
                    selectedChoice,
                    correct: isCorrect
                }
                if (isCorrectChoiceSelected) {
                    isCorrectChoiceSelected = null;
                    selectedChoice = null;
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte wähle zuerst eine Antwort',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    selectedChoice: null,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.PHOTO) {
            if (photo == '') {
                const toast = await this.toastController.create({
                    message: 'Bitte mache ein Foto',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();

                isCorrect = false;
                answer = {
                    photo: null,
                    correct: isCorrect
                }
            } else {
                this.initFeedback(true);
                isCorrect = true;
                answer = {
                    photo,
                    correct: isCorrect
                }
                photo = '';
                photoURL = '';
            }
        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != 'theme-loc') {
            if (this.map.getSource('marker-point')) {
                const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
                const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
                this.initFeedback(isInPolygon, { clickPosition });
                isCorrect = isInPolygon;
                answer = {
                    clickPosition,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte setze zuerst einen Punkt auf der Karte',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    clickPosition: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.DIRECTION) {
            this.initFeedback(this.Math.abs(directionBearing - compassHeading) <= this.DIRECTION_TRESHOLD);
            isCorrect = this.Math.abs(directionBearing - compassHeading) <= this.DIRECTION_TRESHOLD;
            answer = {
                compassHeading,
                correct: isCorrect
            }
        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            if (clickDirection != 0) {
                if (this.task.question.type == QuestionType.MAP_DIRECTION_PHOTO) {
                    this.initFeedback(this.Math.abs(clickDirection - this.task.question.direction.bearing) <= this.DIRECTION_TRESHOLD, { clickDirection });
                    isCorrect = this.Math.abs(clickDirection - this.task.question.direction.bearing) <= this.DIRECTION_TRESHOLD;
                } else {
                    this.initFeedback(this.Math.abs(clickDirection - compassHeading) <= this.DIRECTION_TRESHOLD, { clickDirection });
                    isCorrect = this.Math.abs(clickDirection - compassHeading) <= this.DIRECTION_TRESHOLD;
                }
                answer = {
                    clickDirection,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte setze zuerst deine Blickrichtung',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    compassHeading: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.NUMBER) {
            if (numberInput != undefined) {
                isCorrect = numberInput == this.task.answer.number
                this.initFeedback(isCorrect);
                answer = {
                    numberInput,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte gib zuerst eine Zahl ein',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    numberInput: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.TEXT) {
            if (textInput != undefined) {
                this.initFeedback(true);
                isCorrect = true;
                answer = {
                    text: textInput,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: 'Bitte gib zuerst eine Antwort ein',
                    color: 'dark',
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    text: undefined,
                    correct: isCorrect
                }
            }
        }

        this.trackerService.addEvent({
            type: 'ON_OK_CLICKED',
            correct: isCorrect,
            answer
        });
    }

    public initFeedback(correct: boolean, options: any = undefined) {
        // feedback is already showing.
        if (this.showFeedback) {
            return;
        }

        let type: FeedbackType;

        if (this.task.settings.feedback) {
            if (correct) {
                type = FeedbackType.Correct;
            } else if (this.task.settings.multipleTries) {
                type = FeedbackType.TryAgain;
            } else {
                type = FeedbackType.Wrong;
            }
        } else {
            if (this.task.category == 'nav' && !this.task.settings.confirmation) {
                type = FeedbackType.Success
            } else {
                type = FeedbackType.Saved
            }
        }

        switch (type) {
            case FeedbackType.Correct:
                this.feedback.icon = '😊'
                this.feedback.text = 'Du hast die Aufgabe richtig gelöst!'
                break;
            case FeedbackType.Wrong:
                this.feedback.icon = '😕'
                this.feedback.text = 'Das stimmt leider nicht. Die richtige Lösung wird in Grün angezeigt.'
                break;
            case FeedbackType.TryAgain:
                this.feedback.icon = '😕'
                this.feedback.text = 'Probiere es noch einmal!'
                this.feedbackRetry = true;
                break;
            case FeedbackType.Saved:
                this.feedback.icon = ''
                this.feedback.text = 'Deine Antwort wurde gespeichert!'
                break;
            case FeedbackType.Success:
                this.feedback.icon = ''
                this.feedback.text = 'Ziel erreicht!'
                break;
        }

        this.feedback.hint = ''
        this.feedback.solution = ''

        if (this.task.settings.feedback && !this.task.settings.multipleTries && !correct) {
            this.showSolution()
        }

        if (this.task.settings.feedback && this.task.settings.multipleTries && type === FeedbackType.TryAgain && !correct) {

            this.showHint(options)
        }

        this.showFeedback = true


        if (type != FeedbackType.TryAgain) {
            if (Capacitor.isNative) {
                Plugins.Haptics.vibrate();
            }
            this.audioPlayer.play()
        }

        if (this.task.settings.multipleTries) {
            setTimeout(() => {
                this.dismissFeedback()
                if (type !== FeedbackType.TryAgain) {
                    this.playingGamePage.nextTask()
                }
            }, this.feedbackDuration)
        }

        if (!this.task.settings.feedback) {
            setTimeout(() => {
                this.dismissFeedback()
                this.playingGamePage.nextTask()
            }, 2000)
        }
    }

    nextTask() {
        this.dismissFeedback()
        this.playingGamePage.nextTask()
    }

    public showHint(options: any = undefined) {
        console.log(options)
        if (this.task.answer.type == AnswerType.POSITION) {
            const waypoint = this.task.answer.position.geometry.coordinates;
            const distance = this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
            const evalDistance = distance - (PlayingGamePage.triggerTreshold as number)
            if (evalDistance > 10) {
                this.feedback.hint = `Du bist ${distance.toFixed(1)} m vom Ziel entfernt.`
            } else {
                this.feedback.hint = `Du bist sehr nah am Ziel.`
            }
        }

        if (this.task.type == 'theme-loc') {
            const evalDistance = options.distance - (PlayingGamePage.triggerTreshold as number)
            if (evalDistance > 10) {
                this.feedback.hint = `Du liegst ${options.distance.toFixed(1)} m daneben.`
            } else {
                this.feedback.hint = `Du bist sehr nah dran.`
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {

        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {

        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != 'theme-loc') {
            const center = centroid(this.task.question.geometry.features[0]);
            console.log(center)
            const waypoint = options.clickPosition;
            const distance = this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], center.geometry.coordinates[1], center.geometry.coordinates[0])
            const evalDistance = distance - (PlayingGamePage.triggerTreshold as number)
            if (evalDistance > 10) {
                this.feedback.hint = `Du liegst ${distance.toFixed(1)} m daneben.`
            } else {
                this.feedback.hint = `Du bist sehr nah dran.`
            }

        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            console.log(this.Math.abs(options.clickDirection - this.task.question.direction.bearing))


            if (this.Math.abs(options.clickDirection - this.task.question.direction.bearing) <= 45) {
                this.feedback.hint = `Das ist fast richtig.`
            } else if (this.Math.abs(options.clickDirection - this.task.question.direction.bearing) <= 135) {
                this.feedback.hint = `Die Richtung stimmt nicht.`
            } else {
                this.feedback.hint = `Die Richtung stimmt nicht. Schau noch einmal nach, was auf deiner linken und deiner rechten Seite zu sehen ist.`
            }
        }

        if (this.task.answer.type == AnswerType.NUMBER) {

        }

        if (this.task.answer.type == AnswerType.TEXT) {

        }
    }

    public showSolution() {
        this.feedback.solution = ''

        if (this.task.answer.type == AnswerType.POSITION) {
            this.map.addSource('geolocate-solution', {
                type: 'geojson',
                data: {
                    type: 'Point',
                    coordinates: [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
                }
            });
            this.map.addLayer({
                id: 'geolocate-solution',
                source: 'geolocate-solution',
                type: 'symbol',
                layout: {
                    'icon-image': 'geolocate-solution',
                    'icon-size': 0.4,
                    'icon-offset': [0, 0],
                    'icon-allow-overlap': true
                }
            });
        }

        if (this.task.type == 'theme-loc') {
            this.map.addSource('geolocate-solution', {
                type: 'geojson',
                data: {
                    type: 'Point',
                    coordinates: [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
                }
            });
            this.map.addLayer({
                id: 'geolocate-solution',
                source: 'geolocate-solution',
                type: 'symbol',
                layout: {
                    'icon-image': 'geolocate-solution',
                    'icon-size': 0.4,
                    'icon-offset': [0, 0],
                    'icon-allow-overlap': true
                }
            });
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
            this.feedback.solution = `Die korrekte Lösung ist`
            this.feedback.img = this.task.answer.photos[0]
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
            this.feedback.solution = `Die korrekte Lösung ist ${this.task.answer.choices[0]}`
        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != 'theme-loc') {
            this.showSolutionLandmark(this.task.question.geometry)
        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            let position
            let direction

            if (this.task.question.direction?.position) {
                position = this.task.question.direction.position.geometry.coordinates
            } else {
                position = [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
            }

            if (this.task.question.direction?.bearing) {
                direction = this.task.question.direction.bearing
            } else {
                direction = this.direction || 0
            }

            this.map.addSource('direction-solution', {
                type: 'geojson',
                data: {
                    type: 'Point',
                    coordinates: position
                }
            });
            this.map.addLayer({
                id: 'direction-solution',
                source: 'direction-solution',
                type: 'symbol',
                layout: {
                    'icon-image': 'direction-solution',
                    'icon-size': 0.65,
                    'icon-offset': [0, -8],
                    'icon-rotate': direction
                }
            });
        }

        if (this.task.answer.type == AnswerType.NUMBER) {
            this.feedback.solution = `Die korrekte Lösung ist ${this.task.answer.number}`
        }

        if (this.task.answer.type == AnswerType.TEXT) {

        }
    }

    public removeSolution() {
        if (this.map.getLayer('geolocate-solution')) {
            this.map.removeLayer('geolocate-solution')
            this.map.removeSource('geolocate-solution')
        }
        if (this.map.getLayer('direction-solution')) {
            this.map.removeLayer('direction-solution')
            this.map.removeSource('direction-solution')
        }
        if (this.map.getLayer('solution-polygon')) {
            this.map.removeLayer('solution-polygon')
            this.map.removeSource('solution-source')
        }
    }

    public showSolutionLandmark(landmark: any) {
        this.removeSolution();

        this.map.addSource('solution-source', {
            type: 'geojson',
            data: landmark
        })
        this.map.addLayer({
            id: 'solution-polygon',
            type: 'fill-extrusion',
            source: 'solution-source',
            filter: ['all', ['==', ['geometry-type'], 'Polygon']],
            paint: {
                'fill-extrusion-color': this.successColor,
                'fill-extrusion-opacity': 0.5,
                'fill-extrusion-height': 20,
            }
        });
    }

    public dismissFeedback() {
        this.showFeedback = false;
        this.feedbackRetry = false;
        this.removeSolution();

        this.changeDetectorRef.detectChanges()
    }

    public remove(): void {
        this.positionSubscription.unsubscribe();
        this.deviceOrientationSubscription.unsubscribe();
    }

    public onWaypointReached() {
        this.trackerService.addEvent({
            type: 'WAYPOINT_REACHED'
        });
        this.initFeedback(true);
    }

    private userDidArrive(waypoint): boolean {
        const targetDistance = this.helperService.getDistanceFromLatLonInM(
            waypoint[1],
            waypoint[0],
            this.lastKnownPosition.coords.latitude,
            this.lastKnownPosition.coords.longitude
        );
        this.playingGamePage.targetDistance = targetDistance
        return targetDistance < PlayingGamePage.triggerTreshold;
    }

    get staticShowSuccess() {
        return PlayingGamePage.showSuccess
    }

    public getMapClickAnswer({
        selectedPhoto,
        isCorrectPhotoSelected,
        selectedChoice,
        isCorrectChoiceSelected,
        photo,
        photoURL,
        directionBearing,
        compassHeading,
        clickDirection,
        numberInput,
        textInput
    }, clickPosition) {
        // -------
        // Feedback in Map Click (needs to be in seperate function later on)
        // -------
        let answer;

        if (this.task.answer.type == AnswerType.POSITION) {
            const waypoint = this.task.answer.position.geometry.coordinates;
            const arrived = this.userDidArrive(waypoint);
            answer = {
                target: waypoint,
                position: this.lastKnownPosition,
                distance: this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude),
                correct: arrived
            }
        }

        if (this.task.type == 'theme-loc') {
            if (this.map.getSource('marker-point')) {
                const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
                answer = {
                    clickPosition,
                    distance,
                    correct: distance < PlayingGamePage.triggerTreshold
                }
            } else {
                answer = {
                    clickPosition: undefined,
                    distance: undefined,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
            if (selectedPhoto != null) {
                answer = {
                    selectedPhoto,
                    correct: isCorrectPhotoSelected
                }
            } else {
                answer = {
                    selectedPhoto: null,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
            if (selectedChoice != null) {
                answer = {
                    selectedChoice,
                    correct: isCorrectChoiceSelected
                }
            } else {
                answer = {
                    selectedChoice: null,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.PHOTO) {
            if (photo == '') {
                answer = {
                    photo: null,
                    correct: false
                }
            } else {
                answer = {
                    photo,
                    correct: true
                }
            }
        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != 'theme-loc') {
            if (this.map.getSource('marker-point')) {
                const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
                answer = {
                    clickPosition,
                    correct: isInPolygon
                }
            } else {
                answer = {
                    clickPosition: undefined,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.DIRECTION) {
            answer = {
                compassHeading,
                correct: this.Math.abs(directionBearing - compassHeading) <= 22.5
            }
        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            let isCorrect = false;
            if (clickDirection != 0) {
                if (this.task.question.type == QuestionType.MAP_DIRECTION_PHOTO) {
                    isCorrect = this.Math.abs(clickDirection - this.task.question.direction.bearing) <= this.DIRECTION_TRESHOLD;
                } else {
                    isCorrect = this.Math.abs(clickDirection - compassHeading) <= this.DIRECTION_TRESHOLD;
                }
                answer = {
                    clickDirection,
                    correct: isCorrect
                }
            } else {
                answer = {
                    compassHeading: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.NUMBER) {
            answer = {
                numberInput,
                correct: numberInput == this.task.answer.number
            }
        }

        if (this.task.answer.type == AnswerType.TEXT) {
            answer = {
                text: textInput,
                correct: textInput != undefined
            }
        }

        // -------
        // End of Feedback in Map Click (needs to be in seperate function later on)
        // -------

        return answer
    }
}