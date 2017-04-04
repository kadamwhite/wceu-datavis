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

export const REQUEST_ALL = 'REQUEST_ALL';
export const requestAll = () => ({
  type: REQUEST_ALL,
});

export const REQUEST_POSTS = 'REQUEST_POSTS';
export const requestPosts = () => ({
  type: REQUEST_POSTS,
});

export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const receivePosts = posts => ({
  type: RECEIVE_POSTS,
  payload: posts,
});

export const REQUEST_TAGS = 'REQUEST_TAGS';
export const requestTags = () => ({
  type: REQUEST_TAGS,
});

export const RECEIVE_TAGS = 'RECEIVE_TAGS';
export const receiveTags = tags => ({
  type: RECEIVE_TAGS,
  payload: tags,
});

export const REQUEST_CATEGORIES = 'REQUEST_CATEGORIES';
export const requestCategories = () => ({
  type: REQUEST_CATEGORIES,
});

export const RECEIVE_CATEGORIES = 'RECEIVE_CATEGORIES';
export const receiveCategories = categories => ({
  type: RECEIVE_CATEGORIES,
  payload: categories,
});
