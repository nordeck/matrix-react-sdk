import React from 'react';
import {_t} from '../../../languageHandler';
import BaseDialog from '../dialogs/BaseDialog';
import DialogButtons from '../elements/DialogButtons';
import Field from '../elements/Field';
import Dropdown from '../elements/Dropdown';
import {MatrixClientPeg} from "../../../MatrixClientPeg";
import DMRoomMap from '../../../utils/DMRoomMap'
import RoomMember from "matrix-js-sdk/src/models/room-member";
import RoomViewStore from '../../../stores/RoomViewStore';
import UserSelection from "../rooms/UserSelection";

interface IState {
    meetingTopic: string;
    meetingDate: string;
    meetingTimeFrom: string;
    meetingTimeTill: string;
    parentRoom: string;
    userSelection: Record<string, RoomMember>;
}

export default class CreateMeetingDialog extends React.Component<IState> {

// Util functions
    private formattedDate = (d: Date = new Date()): string => {
        return d.toISOString().split('T')[0];
    }

    private formattedTime = (d: Date = new Date()): string => {
        return new Intl.DateTimeFormat(undefined,{hour: '2-digit', minute: '2-digit', hour12: false}).format(d);
    }

    private germanDate = (d: Date = new Date()): string => {
        return d.toLocaleDateString("de-DE", { day: '2-digit', month: '2-digit', year: 'numeric'});
    }

    private generateMeetingTitle = (roomName: string): string => {
        const date = new Date(this.state.meetingDate);
        return roomName + "-" + this.germanDate(date) + "-" + this.state.meetingTimeFrom;
    }

    private isDM = (room_id: string): boolean => {
        const id = DMRoomMap.shared().getUserIdForRoomId(room_id);
        return id !== undefined && id !== "";
    }

    private setUserSelection = (selection) => {
        this.setState({userSelection: selection});
    }

// modal interactivity functions
    private onOk = () => {return null;}
    private onFinished = () => {return null;}
    private onCancel = () => {return null;}
    private onParentRoomChange = (ev) => {
        this.setState({parentRoom: ev});
    }
    private onUserSelectChange = () => {return null;}
    private onTopicChange = (ev) => {this.setState({meetingTopic: ev.target.value})}
    private onDateChange = (ev) => {this.setState({meetingDate: ev.target.value})}
    private onFromChange = (ev) => {this.setState({meetingTimeFrom: ev.target.value})}
    private onTillChange = (ev) => {this.setState({meetingTimeTill: ev.target.value})}

    state = {
        meetingTopic: "",
        meetingDate: this.formattedDate(),
        meetingTimeFrom: this.formattedTime(new Date()),
        meetingTimeTill: this.formattedTime(new Date(Date.now() + (60*60*1000))),
        parentRoom: RoomViewStore.getRoomId(),
        userSelection: {}
    };

    public render() {
        const client = MatrixClientPeg.get();
        const rooms = client.getVisibleRooms().filter(room => !this.isDM(room.roomId));
        const currentRoom = client.getVisibleRooms().filter(room => room.roomId === this.state.parentRoom)[0];
        const meetingTitle = this.generateMeetingTitle(currentRoom.name);
        const parentRoomOptions = rooms.map(room => {
            return <div key={ room.roomId }>{ room.name }</div>
        });

        return(
            <BaseDialog className="mx_CreateMeetingDialog" title={_t("Schedule Meeting")} onFinished={this.onFinished} >
                <form onSubmit={this.onOk}>
                    <Field type="text" value={ meetingTitle } label={_t("Meeting Title")} disabled/>
                    <Field type="text" value={this.state.meetingTopic} onChange={this.onTopicChange} label={_t("Meeting Topic")}/>
                    <Dropdown
                        id="parentRoomDropDown"
                        label={_t("Parent Room")}
                        value={this.state.parentRoom}
                        onOptionChange={this.onParentRoomChange}
                        className="mx_Dropdown"
                    >
                        { parentRoomOptions }
                    </Dropdown>
                    <Field type="date" value={this.state.meetingDate} label={_t("Date")} onChange={this.onDateChange} />
                    <Field type="time" value={this.state.meetingTimeFrom} label={_t("From")} onChange={this.onFromChange} />
                    <Field type="time" value={this.state.meetingTimeTill} label={_t("Till")} onChange={this.onTillChange} />
                    <DialogButtons
                        primaryButton={_t('Create Meeting')}
                        onPrimaryButtonClick={this.onOk}
                        onCancel={this.onCancel}
                    />
                    <UserSelection roomId={this.state.parentRoom} userSelectionCallback={this.setUserSelection} />
                </form>
            </BaseDialog>
        );
    }
}
