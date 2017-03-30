import React, { Component, PropTypes } from 'react';

class MessageForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      message: '',
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMessageChange(event) {
    this.setState({
      message: event.target.value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.message) {
      this.props.onSubmit(this.state.message);
      this.setState({
        message: '',
      });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="message-content">Add a Message</label>
        <textarea
          name="message"
          id="message-content"
          value={this.state.message}
          onChange={this.handleMessageChange}
        />
        <button type="submit">Save</button>
      </form>
    );
  }
}

MessageForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default MessageForm;
