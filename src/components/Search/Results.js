import React, { Component } from 'react';
import SearchStore from '../../stores/SearchStore';
import { browserHistory } from 'react-router';

import Loading from 'react-loading-bar';
import 'react-loading-bar/dist/index.css';

import ChatActions from '../../actions/ChatActions';
import MessageStore from '../../stores/MessageStore';

export default class Results extends Component {
  constructor() {
    super();

    this.state = {
      results: SearchStore.getResults(),
      chatrooms: MessageStore.getChatrooms(),
      newKey: MessageStore.getNewKey(),
      chatroom: MessageStore.getChatroom()
    }

    this._onChange = this._onChange.bind(this);
    this._checkIfExists = this._checkIfExists.bind(this);
    this._createChatRoom = this._createChatRoom.bind(this);
    this._navigate = this._navigate.bind(this);
  }

  componentDidMount() {
    ChatActions.getChatrooms();
    MessageStore.startListening(this._onChange);
    SearchStore.startListening(this._onChange);
  }

  componentWillUnmount() {
    MessageStore.stopListening(this._onChange);
    SearchStore.stopListening(this._onChange);
  }

  _onChange() {
    this.setState({
      results: SearchStore.getResults(),
      chatrooms: MessageStore.getChatrooms(),
      newKey: MessageStore.getNewKey(),
      chatroom: MessageStore.getChatroom()
    })
  }

  _checkIfExists(title, link, summary) {
    let existingRooms = this.state.chatrooms;

    // FILTER EXISTING CHATROOMS TO SEE IF ONE WITH THE SAME TITLE EXISTS
    let existingObj = existingRooms.filter(object => {
      return object.name === title;
    })

    // IF EXISTS, send user to existing chatroom, ELSE, create a new chatroom
    if (existingObj[0]) {
      browserHistory.push(`/chat/${existingObj[0].key}`)
    } else {
      this._createChatRoom(title, link, summary);
    }
  }

  _navigate() {
    browserHistory.push(`/rooms`);
  }

  _createChatRoom(title, link, summary) {
    // FUNCTION TO CREATE NEW CHATROOM
    ChatActions.createChatroom(title, link, summary)
    let newObj = {
      title, link, summary
    }
    ChatActions.createChatroomDetails(newObj);
    this.setState({newKey: MessageStore.getNewKey()});
    this.setState({chatroom: MessageStore.getChatroom()});
    this._navigate()
  }

  render() {
    if (this.state.results) {
      const Results = this.state.results.map((result, index) => {
        // MAP THE FOLLOWING DIV ELEMENT PER CHATROOM
        return (
          <div key={index}>
            <hr/>
            <h4 className="articleTitle" onClick={this._checkIfExists.bind(null, result.title, result.link, result.summary)}>{result.title}</h4>
            <a href={result.link} target="_blank">{result.link}</a>
            <p>{result.summary}</p>
          </div>
        )
      })

      return (
        <div>
        {Results}
        </div>
      )

    } else {
      <Loading show={true} color="blue" />
    }

  }
}
