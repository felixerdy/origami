import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PopoverComponent } from './popover/popover.component';
import { FormsModule } from '@angular/forms';

// Modals
import { CreateTaskModalPage } from './pages/create-game/create-task-modal/create-task-modal.page';
import { CreateFreeTaskModalComponent } from './pages/create-game/create-free-task-modal/create-free-task-modal.component';
import { CreateModuleModalPage } from './pages/create-game/create-module-modal/create-module-modal.page';
import { MapFeaturesModalPage } from './pages/create-game/map-features-modal/map-features-modal.page';
import { CreateInfoModalComponent } from './pages/create-game/create-info-modal/create-info-modal.component';

import { DeviceOrientation } from '@ionic-native/device-orientation/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { QuestionTypeComponent } from './pages/create-game/form-elements/question-types/question-type.component';
import { AnswerTypeComponent } from './pages/create-game/form-elements/answer-types/answer-type.component';
import { MapComponent } from './pages/create-game/form-elements/map/map.component';
import { PhotoUploadMultipleChoiceComponent } from './pages/create-game/form-elements/photo-upload-multiple-choice/photo-upload-multiple-choice.component';
import { PhotoUploadComponent } from './pages/create-game/form-elements/photo-upload/photo-upload.component';
import { MultipleChoiceTextComponent } from './pages/create-game/form-elements/multiple-choice-text/multiple-choice-text.component';

import { TypeToTextPipe } from './pipes/typeToText.pipe';
import { AudioRecorderComponent } from './pages/create-game/form-elements/audio-recorder/audio-recorder.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { AudioPlayerModule } from './components/audio-player/audio-player.module';

import { MarkdownModule } from 'ngx-markdown';
import { TokenInterceptor } from './services/token-intercepor.service';
import { HelperService } from './services/helper.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/* VR world
* Using sockit.IO for receiving data from VR App
*/
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'https://unity-ionic-v5.herokuapp.com/', options: {} };


@NgModule({
  declarations: [
    AppComponent,
    PopoverComponent,
    CreateTaskModalPage,
    CreateFreeTaskModalComponent,
    MapFeaturesModalPage,
    CreateModuleModalPage,
    CreateInfoModalComponent,
    MapComponent,
    PhotoUploadMultipleChoiceComponent,
    PhotoUploadComponent,
    MultipleChoiceTextComponent,
    AudioRecorderComponent,
    QuestionTypeComponent,
    AnswerTypeComponent,
    TypeToTextPipe,
  ],
  exports: [],
  entryComponents: [
    PopoverComponent,
    CreateTaskModalPage,
    CreateFreeTaskModalComponent,
    MapFeaturesModalPage,
    CreateModuleModalPage,
    CreateInfoModalComponent,
  ],
  imports: [
    AudioPlayerModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    IonicModule.forRoot({
      backButtonText: 'Zurück',
    }),
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    IonicStorageModule.forRoot({
      driverOrder: ['localstorage', 'indexeddb'],
    }),
    MarkdownModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DeviceOrientation,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    HelperService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
