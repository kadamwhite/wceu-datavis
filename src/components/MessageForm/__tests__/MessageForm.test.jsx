import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import MessageForm from '../MessageForm';

describe('MessageForm component', () => {

  it('renders without crashing', () => {
    shallow(<MessageForm onSubmit={() => {}} />);
  });

  it('renders a textarea', () => {
    const wrapper = shallow(<MessageForm onSubmit={() => {}} />);
    expect(wrapper.find('textarea').length).toBe(1);
  });

  it('renders a submit button', () => {
    const wrapper = shallow(<MessageForm onSubmit={() => {}} />);
    expect(wrapper.find('button[type="submit"]').length).toBe(1);
  });

  it('submits the textarea value to props.onSubmit', () => {
    const onSubmit = stub();
    const mockEvent = { preventDefault: stub() };
    const message = 'Some Message';
    const wrapper = shallow(<MessageForm onSubmit={onSubmit} />);
    wrapper.find('textarea').simulate('change', {
      target: {
        value: message,
      },
    });
    expect(wrapper.find('textarea').prop('value')).toBe(message);
    wrapper.find('form').simulate('submit', mockEvent);
    expect(mockEvent.preventDefault.calledOnce).toBe(true);
    expect(onSubmit.calledOnce).toBe(true);
    expect(onSubmit.calledWith(message)).toBe(true);
  });

  it('does not trigger props.onSubmit when no message has been provided', () => {
    const onSubmit = stub();
    const mockEvent = { preventDefault: stub() };
    const wrapper = shallow(<MessageForm onSubmit={onSubmit} />);
    wrapper.find('form').simulate('submit', mockEvent);
    expect(mockEvent.preventDefault.calledOnce).toBe(true);
    expect(onSubmit.calledOnce).toBe(false);
  });

  it('clears the textarea on submit', () => {
    const onSubmit = stub();
    const mockEvent = { preventDefault: stub() };
    const message = 'Some Message';
    const wrapper = shallow(<MessageForm onSubmit={onSubmit} />);
    wrapper.find('textarea').simulate('change', {
      target: {
        value: message,
      },
    });
    wrapper.find('form').simulate('submit', mockEvent);
    expect(wrapper.find('textarea').prop('value')).toBe('');
  });

});
