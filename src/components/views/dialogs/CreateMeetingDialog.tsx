import React from 'react';
import {_t} from '../../../languageHandler';
import BaseDialog from '../dialogs/BaseDialog';
import DialogButtons from '../elements/DialogButtons';
import Field from '../elements/Field';
import Dropdown from '../elements/Dropdown';
import {MatrixClientPeg} from "../../../MatrixClientPeg";
import DMRoomMap from '../../../utils/DMRoomMap'
import RoomViewStore from '../../../stores/RoomViewStore';
import UserSelection from "../rooms/UserSelection";
import {Meeting} from '../../../utils/Meeting'
import StyledCheckbox from "../elements/StyledCheckbox";

interface IState {
    meetingTopic: string;
    meetingDate: string;
    meetingTimeFrom: string;
    meetingTimeTill: string;
    parentRoom: string;
    userSelection: Array<string>;
    autoJoin: boolean;
}

interface IProps {
    onFinished(b: boolean);
}

export default class CreateMeetingDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
    }

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

    private generateMeetingTitle = (): string => {
        const roomName = this.getParentRoom().name;
        const date = new Date(this.state.meetingDate);
        return roomName + "-" + this.germanDate(date) + "-" + this.state.meetingTimeFrom;
    }

    private isDM = (room_id: string): boolean => {
        const id = DMRoomMap.shared().getUserIdForRoomId(room_id);
        return id !== undefined && id !== "";
    }

    private setUserSelection = (selection) => {
        this.state.userSelection = selection;
    }

    private isValidMeeting = () => {
        const oneDay = 86400000;
        // Create a date object with the current day at 00:00 o'clock
        const dateTodayBase = new Date(); dateTodayBase.setHours(0,0,0,0);
        const isMeetingScheduledForAFutureDate = new Date(this.state.meetingDate) >= new Date(dateTodayBase.getTime() + oneDay);
        const areUsersSelected = this.state.userSelection.length > 0;
        const validDate = new Date(this.state.meetingDate) >= dateTodayBase;
        const startTime = new Date("1/1/1999 " + this.state.meetingTimeFrom + ":00");
        const currentTime = new Date("1/1/1999 " + this.formattedTime() + ":00");
        // If the meeting is in the future, then the starting time isn't relevant, else check if it is before now
        const validStartingTime = isMeetingScheduledForAFutureDate ? true : startTime >= currentTime;
        return areUsersSelected && validDate && validStartingTime;
    }

    private getParentRoom = () => {
        const client = MatrixClientPeg.get();
        return client.getVisibleRooms().filter(room => room.roomId === this.state.parentRoom)[0];
    }

    private getUsableMeetingDate = (time: string = "00:00", date: string = this.state.meetingDate): Date => {
         // Format of date: "2020-09-24"
         // Format of time: "15:11"
         // Possible valid input format of Date: 1995-12-17T03:24:00
        return new Date(date + 'T' + time + ':00');
    }

// modal interactivity functions
    private onOk = () => {
        if(!this.isValidMeeting()){
            alert("Something went wrong");
            return;
        }
        const state = this.state;
        const roomId = this.state.parentRoom;
        const eventType = "nic.meetings.meeting";
        const meeting = new Meeting();

        const meetingStart = this.getUsableMeetingDate(state.meetingTimeFrom).getTime();
        const possibleMeetingEnd = this.getUsableMeetingDate(state.meetingTimeTill).getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const meetingEnd = possibleMeetingEnd > meetingStart
            ? possibleMeetingEnd
            : possibleMeetingEnd + oneDay;

        meeting.name = this.generateMeetingTitle();
        meeting.topic = state.meetingTopic;
        meeting.parent_room_id = state.parentRoom;
        meeting.parent_room_name = this.getParentRoom().name;
        meeting.room_name = this.generateMeetingTitle();
        meeting.start_time = meetingStart;
        meeting.end_time = meetingEnd;
        meeting.creator = MatrixClientPeg.get().getUserId();
        meeting.participants = state.userSelection;
        meeting.auto_join = state.autoJoin;
        meeting.widgets = ["jitsi", "etherpad"];

        MatrixClientPeg.get().sendStateEvent(roomId, eventType, meeting, meeting.meeting_id);
        this.props.onFinished(true);
    }

    private onFinished = () => {this.props.onFinished(false)}
    private onCancel = () => {this.props.onFinished(false)}
    private onParentRoomChange = (ev) => {this.setState({parentRoom: ev})}
    private onTopicChange = (ev) => {this.setState({meetingTopic: ev.target.value})}
    private onDateChange = (ev) => {this.setState({meetingDate: ev.target.value})}
    private onFromChange = (ev) => {this.setState({meetingTimeFrom: ev.target.value})}
    private onTillChange = (ev) => {this.setState({meetingTimeTill: ev.target.value})}
    private onAutoJoinChange = () => {this.setState({autoJoin: !this.state.autoJoin})}

    state = {
        meetingTopic: "",
        meetingDate: this.formattedDate(),
        meetingTimeFrom: this.formattedTime(new Date(Date.now() + (5*60*1000))),
        meetingTimeTill: this.formattedTime(new Date(Date.now() + (65*60*1000))),
        parentRoom: RoomViewStore.getRoomId(),
        userSelection: [MatrixClientPeg.get().getUserId()], // needs to be prefilled
        autoJoin: false,
    };

    public render() {
        const client = MatrixClientPeg.get();
        const rooms = client.getVisibleRooms().filter(room => !this.isDM(room.roomId));
        const meetingTitle = this.generateMeetingTitle();
        const parentRoomOptions = rooms.map(room => {
            return <div key={ room.roomId }>{ room.name }</div>
        });
        const buttons = this.isValidMeeting()
            ? <DialogButtons
                primaryButton={_t('Create Meeting')}
                onPrimaryButtonClick={this.onOk}
                onCancel={this.onCancel} />
            : <DialogButtons
                primaryButton={_t('Create Meeting')}
                onPrimaryButtonClick={this.onOk}
                onCancel={this.onCancel}
                primaryDisabled={true} />;

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
                    <StyledCheckbox checked={this.state.autoJoin} onChange={this.onAutoJoinChange}>
                        {_t("Invited users automatically accept the meeting invitation")}
                    </StyledCheckbox>
                    { buttons }
                    <UserSelection roomId={this.state.parentRoom} userSelectionCallback={this.setUserSelection} />
                </form>
            </BaseDialog>
        );
    }
}
