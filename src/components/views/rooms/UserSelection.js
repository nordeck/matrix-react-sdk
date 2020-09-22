import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {_t} from "../../../languageHandler";
import {MatrixClientPeg} from "../../../MatrixClientPeg";
import {getHttpUriForMxc} from "matrix-js-sdk/src/content-repo";
import BaseAvatar from "../../views/avatars/BaseAvatar";
import AccessibleButton from "../../views/elements/AccessibleButton";
import {makeUserPermalink} from "../../../utils/permalinks/Permalinks";
import {RoomMember} from "matrix-js-sdk/src/matrix";
import * as sdk from "../../../index";
import RoomViewStore from "../../../stores/RoomViewStore";

const INITIAL_USERS_SHOWN = 10;
const INCREMENT_USER_SHOWN = 10;

class Member {
    get name(): string { throw new Error("Member class not implemented"); }
    get userId(): string { throw new Error("Member class not implemented"); }
    getMxcAvatarUrl(): string { throw new Error("Member class not implemented"); }
}

class DMRoomTile extends React.PureComponent {
    static propTypes = {
        member: PropTypes.object.isRequired, // Should be a Member (see interface above)
        onToggle: PropTypes.func.isRequired, // takes 1 argument, the member being toggled
        highlightWord: PropTypes.string,
        isSelected: PropTypes.bool,
    };

    _onClick = (e) => {
        // Stop the browser from highlighting text
        e.preventDefault();
        e.stopPropagation();

        this.props.onToggle(this.props.member);
    };

    _highlightName(str: string) {
        if (!this.props.highlightWord) return str;

        // We convert things to lowercase for index searching, but pull substrings from
        // the submitted text to preserve case. Note: we don't need to htmlEntities the
        // string because React will safely encode the text for us.
        const lowerStr = str.toLowerCase();
        const filterStr = this.props.highlightWord.toLowerCase();

        const result = [];

        let i = 0;
        let ii;
        while ((ii = lowerStr.indexOf(filterStr, i)) >= 0) {
            // Push any text we missed (first bit/middle of text)
            if (ii > i) {
                // Push any text we aren't highlighting (middle of text match, or beginning of text)
                result.push(<span key={i + 'begin'}>{str.substring(i, ii)}</span>);
            }

            i = ii; // copy over ii only if we have a match (to preserve i for end-of-text matching)

            // Highlight the word the user entered
            const substr = str.substring(i, filterStr.length + i);
            result.push(<span className='mx_InviteDialog_roomTile_highlight' key={i + 'bold'}>{substr}</span>);
            i += substr.length;
        }

        // Push any text we missed (end of text)
        if (i < str.length) {
            result.push(<span key={i + 'end'}>{str.substring(i)}</span>);
        }

        return result;
    }

    render() {
        const client = MatrixClientPeg.get();
        const member = this.props.member;
        const avatarSize = 36;
        const emailAvatar = require("../../../../res/img/icon-email-pill-avatar.svg");
        const avatar = member.isEmail
            ? <img
                src={ emailAvatar } alt={_t("User Icon")}
                width={ avatarSize } height={ avatarSize }/>
            : <BaseAvatar
                url={getHttpUriForMxc(
                    client.getHomeserverUrl(), member.getMxcAvatarUrl(),
                    avatarSize, avatarSize, "crop")}
                name={ member.name }
                idName={ member.userId }
                width={ avatarSize }
                height={ avatarSize } />;

        let checkmark = null;
        if (this.props.isSelected) {
            // To reduce flickering we put the 'selected' room tile above the real avatar
            checkmark = <div className='mx_InviteDialog_roomTile_selected' />;
        }

        // To reduce flickering we put the checkmark on top of the actual avatar (prevents
        // the browser from reloading the image source when the avatar remounts).
        const stackedAvatar = (
            <span className='mx_InviteDialog_roomTile_avatarStack'>
                { avatar }
                { checkmark }
            </span>
        );

        return (
            <div className='mx_InviteDialog_roomTile' onClick={this._onClick}>
                { stackedAvatar }
                <span className='mx_InviteDialog_roomTile_name'>{this._highlightName(member.name)}</span>
                <span className='mx_InviteDialog_roomTile_userId'>{this._highlightName(member.userId)}</span>
            </div>
        );
    }
}

export default class UserSelection extends React.Component {
    static propTypes = {
        onFinished: PropTypes.func,
        roomId: PropTypes.string,
    };

    _debounceTimer: number = null;
    _editorRef: any = null;

    constructor(props) {
        super(props);

        this.state = {
            targets: [], // array of Member objects (see interface above)
            filterText: "",
            suggestions: this._buildUserSuggestions(props.roomId),
            numSuggestionsShown: INITIAL_USERS_SHOWN,
            canUseIdentityServer: !!MatrixClientPeg.get().getIdentityServerUrl(),
            tryingIdentityServer: false,
            selectedRoom: "",
        };

        this._editorRef = createRef();
    }

    _updateUserSelectionViaCallback() {
        this.props.userSelectionCallback(this.state.targets.map(u => u.userId));
    }

    _getRoomUsers(roomId: String): [] {
        const client = MatrixClientPeg.get();
        const room = client.getVisibleRooms().filter(room => room.roomId === roomId)[0];
        return Object
            .entries(room.currentState.members)
            .flatMap(entry => {
                return {userId: entry[0], user: entry[1]};
            });
    }

    _selectAllUsers(roomId: string = RoomViewStore.getRoomId()) {
        const allUsers = this._getRoomUsers(roomId);
        const targets = [];
        allUsers.forEach(u => {targets.push(u.user)});
        return targets;
    }

    _buildUserSuggestions(roomId: string = RoomViewStore.getRoomId()): {userId: string, user: RoomMember}  {
        return this._getRoomUsers(roomId);
    }

    _updateFilter = (e) => {
        const term = e.target.value;
        this.setState({filterText: term});
    };

    _showMoreSuggestions = () => {
        this.setState({numSuggestionsShown: this.state.numSuggestionsShown + INCREMENT_USER_SHOWN});
    };

    _toggleMember = (member: Member) => {
        const targets = this.state.targets.map(t => t); // cheap clone for mutation
        const idx = targets.indexOf(member);
        if (idx >= 0) {
            targets.splice(idx, 1);
        } else {
            targets.push(member);
            this.setState({filterText: ""}); // clear the filter when the user accepts a suggestion
        }
        this.setState({targets});
        this._updateUserSelectionViaCallback();
    };

    _onClickInputArea = (e) => {
        // Stop the browser from highlighting text
        e.preventDefault();
        e.stopPropagation();

        if (this._editorRef && this._editorRef.current) {
            this._editorRef.current.focus();
        }
    };

    _renderUserList() {
        let sourceMembers = this.state.suggestions;
        let showNum = this.state.numSuggestionsShown;
        const showMoreFn = this._showMoreSuggestions.bind(this);

        // Hide the section if there's nothing to filter by
        if (sourceMembers.length === 0) return null;

        // Do some simple filtering on the input before going much further. If we get no results, say so.
        if (this.state.filterText) {
            const filterBy = this.state.filterText.toLowerCase();
            sourceMembers = sourceMembers
                .filter(m => m.user.name.toLowerCase().includes(filterBy) || m.userId.toLowerCase().includes(filterBy));

            if (sourceMembers.length === 0) {
                return (
                    <div className='mx_InviteDialog_section'>
                        <p>{_t("No results")}</p>
                    </div>
                );
            }
        }

        // If we're going to hide one member behind 'show more', just use up the space of the button
        // with the member's tile instead.
        if (showNum === sourceMembers.length - 1) showNum++;

        const toRender = sourceMembers.slice(0, showNum);
        const hasMore = toRender.length < sourceMembers.length;

        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
        const showMore = hasMore
            ?   <AccessibleButton onClick={showMoreFn} kind="link">
                    {_t("Show more")}
                </AccessibleButton>
            : null;

        const tiles = toRender.map(r => (
            <DMRoomTile
                member={r.user}
                key={r.userId}
                onToggle={this._toggleMember}
                highlightWord={this.state.filterText}
                isSelected={this.state.targets.some(t => t.userId === r.userId)}
            />
        ));
        return (
            <div className='mx_InviteDialog_section'>
                { tiles }
                { showMore }
            </div>
        );
    }

    _renderEditor() {
        const input = (
            <textarea
                rows={1}
                onChange={this._updateFilter}
                value={this.state.filterText}
                ref={this._editorRef}
                autoFocus={true}
            />
        );
        return (
            <div className='mx_InviteDialog_editor' onClick={this._onClickInputArea}>
                {input}
            </div>
        );
    }

    render() {

        // only do this, if the parentRoom changed
        if(this.props.roomId !== this.state.selectedRoom) {
            // generate list of all users in the selected room
            this.state.suggestions = this._buildUserSuggestions(this.props.roomId);
            // pre-select all users
            this.state.targets = this._selectAllUsers(this.props.roomId);
            // update the roomId in state to track when the parentRoom changes
            this.state.selectedRoom = this.props.roomId;
        }

        const userId = MatrixClientPeg.get().getUserId();
        const helpText = _t(
            "Invite someone using their name, email address, or username (like <userId/>).",
            {},
            {
                userId: () => <a href={makeUserPermalink(userId)} rel="noreferrer noopener" target="_blank">{userId}</a>,
            },
        );

        return (
            <div className='mx_InviteDialog_content'>
                <p className='mx_InviteDialog_helpText'>{helpText}</p>
                <div className='mx_InviteDialog_addressBar'>
                    {this._renderEditor()}
                </div>
                <div className='mx_InviteDialog_userSections'>
                    {this._renderUserList()}
                </div>
            </div>
        );
    }
}
