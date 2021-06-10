/// <reference types="@types/dom-mediacapture-record" />

import { Capacitor, Plugins } from "@capacitor/core";
import { RecordingData, GenericResponse } from "capacitor-voice-recorder";
import { Injectable } from "@angular/core";
import { Observable, interval } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder;
  private audioChunks: BlobPart[] = [];

  constructor() {
    if (Capacitor.platform == "web") {
    } else {
      Plugins.VoiceRecorder.requestAudioRecordingPermission().then(
        (result: GenericResponse) => console.log(result.value)
      );
    }
  }

  async fromFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const request = await fetch(`${environment.apiURL}/file/upload`, {
      method: "POST",
      body: formData,
    });
    const body = await request.json();

    return body;
  }

  start() {
    if (Capacitor.platform == "web") {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.start();
      });
    } else {
      Plugins.VoiceRecorder.startRecording()
        .then((result: GenericResponse) => console.log(result.value))
        .catch((error) => console.log(error));
    }
  }

  stop(): Promise<any> {
    return new Promise((resolve) => {
      if (Capacitor.platform == "web") {
        this.mediaRecorder.onstop = (event) => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/aac" });
          this.audioChunks = [];

          // : Blob = new Blob([buffer], { 'type': result.value.mimeType });

          const audioUrl: string = URL.createObjectURL(audioBlob);
          // const audio: HTMLAudioElement = new Audio(audioUrl);
          // const play: Function = (): Promise<void> => audio.play();

          console.log(audioBlob, audioUrl);

          const formData = new FormData();
          formData.append("file", audioBlob);
          fetch(`${environment.apiURL}/file/upload`, {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((body) => {
              console.log("data upload done");
              resolve(body);
            });
        };

        this.mediaRecorder.stop();
      } else {
        Plugins.VoiceRecorder.stopRecording().then(
          async (result: RecordingData) => {
            console.log(result.value);

            const audio = new Audio(
              `data:audio/aac;base64,${result.value.recordDataBase64}`
            );

            // resolve(audio.src)

            const audioBlob = convertBase64ToBlob(
              `data:audio/aac;base64,${result.value.recordDataBase64}`
            );
            // : Blob = new Blob([buffer], { 'type': result.value.mimeType });
            const audioUrl: string = URL.createObjectURL(audioBlob);
            // const audio: HTMLAudioElement = new Audio(audioUrl);
            const play: Function = (): Promise<void> => audio.play();

            console.log(audioBlob, audioUrl);

            const formData = new FormData();
            formData.append("file", audioBlob);
            fetch(`${environment.apiURL}/file/upload`, {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((body) => {
                resolve(body);
              });
          }
        );
      }
    }).catch((error) => console.log(error));
  }
}

/**
 * Convert BASE64 to BLOB
 * @param base64Image Pass Base64 image data to convert into the BLOB
 */
function convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(";base64,");

  // Hold the content type
  const imageType = parts[0].split(":")[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}
