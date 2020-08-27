import React from "react";
import Spinner from "../elements/Spinner";
import { _t } from '../../../languageHandler';
import MeetingButtons from "../../structures/MeetingButtons";
import AutoHideScrollbar from "../../structures/AutoHideScrollbar";

export default class MeetingPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    render() {
        const title = <div className="mx_MeetingPanel_title">{_t("Meeting History")}</div>;
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
                        <MeetingButtons key="MeetingButtons" />
                    </div>
                </AutoHideScrollbar>
            </div>
        );
    }
}
