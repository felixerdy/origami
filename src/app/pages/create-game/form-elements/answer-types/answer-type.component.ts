import {
    Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter
} from '@angular/core';

import { AnswerType } from './../../../../models/types';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';


@Component({
    selector: 'answer-type',
    templateUrl: './answer-type.component.html',
})
export class AnswerTypeComponent implements OnInit, OnChanges {
    @Input() answer: any;
    @Input() taskType: any;

    // VR world
    @Input() isVirtualWorld: boolean;

    @Output() answerChange: EventEmitter<any> = new EventEmitter<any>(true);

    answerTypeEnum = AnswerType;

    constructor(public popoverController: PopoverController) { }

    ngOnChanges(changes: SimpleChanges): void {
        this.answerChange.emit(changes.answer.currentValue);
    }

    ngOnInit() {
    }

    async showPopover(ev: any, text: string) {
        console.log(ev);
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            event: ev,
            translucent: true,
            componentProps: { text }
        });
        return await popover.present();
    }
}
