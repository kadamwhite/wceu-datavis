import { connect } from 'react-redux';
import { submitMessage } from '../../redux/actions';

import MessageForm from '../MessageForm/MessageForm';

const mapDispatchToProps = dispatch => ({
  onSubmit: message => dispatch(submitMessage(message)),
});

export default connect(null, mapDispatchToProps)(MessageForm);
