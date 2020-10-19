import React from 'react';
import Modal from '../../Modal';
import {_t} from '../../languageHandler';
import CreateMeetingDialog from "../views/dialogs/CreateMeetingDialog";

export default class MeetingButtons extends React.Component {

    private onScheduleMeetingClick = () => {
        Modal.createTrackedDialog('Schedule Meeting','', CreateMeetingDialog);
    }

    render() {
        const scheduleMeetingButtonText = _t("Schedule Meeting")
        return (
            <div className="mx_MeetingButtonContainer" >
                <button className="mx_MeetingButton" key='scheduleMeetingButton' onClick={this.onScheduleMeetingClick}>
                    { scheduleMeetingButtonText }
                </button>
            </div>
        );
    }
}
