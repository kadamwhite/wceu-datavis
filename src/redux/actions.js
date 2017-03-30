/**
 * This file defines the redux actions within the application. It should
 * eventually be split up into multiple files.
 *
 * Actions follow the Flux Standard Action format, described in more detail
 * here: https://github.com/acdlite/flux-standard-action We do not utilize
 * libraries like redux-actions at this time, as they do not provide tangible
 * benefits over manually conforming to a standard in an application of this
 * size; they could be considered later on as the application grows.
 */

export const SUBMIT_MESSAGE = 'SUBMIT_MESSAGE';
export const submitMessage = message => ({
  type: SUBMIT_MESSAGE,
  payload: message,
});
