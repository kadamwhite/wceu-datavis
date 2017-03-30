import React, { PropTypes } from 'react';

const Messages = ({ messages }) => (
  <ul>{messages.map(message => (
    <li key={message}>{message}</li>
  ))}</ul>
);

Messages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Messages;
