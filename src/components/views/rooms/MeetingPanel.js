import React from "react";
import AutoHideScrollbar from "../../structures/AutoHideScrollbar";
import Spinner from "../elements/Spinner";
import { _t } from '../../../languageHandler';

/*
 * Component which shows the meeting history list
 */

export default class MeetingPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    render() {
        const title = <div className="mx_MeetingPanel_title">{_t("mx.interface.rightPanel.meetingTab.title")}</div>;
        if (this.state.loading) {
            return (
                <div className="mx_MeetingPanel" role="tabpanel">
                    { title }
                    <Spinner />
                </div>
            );
        }
        return (
            <div className="mx_MeetingPanel" role="tabpanel">
                <AutoHideScrollbar>
                    <div className="mx_MeetingPanel_wrapper">
                        { title }
                    </div>
                </AutoHideScrollbar>
            </div>
        );
    }
}
