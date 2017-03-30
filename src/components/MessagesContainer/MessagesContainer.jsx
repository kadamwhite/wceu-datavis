import { connect } from 'react-redux';
import { getMessages } from '../../redux/reducers';

import Messages from '../Messages/Messages';

const mapStateToProps = state => ({
  messages: getMessages(state),
});

export default connect(mapStateToProps)(Messages);
