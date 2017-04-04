/* eslint-disable no-underscore-dangle */// Part of external API
import WPAPI from 'wpapi';
import { PropTypes } from 'react';

let { WPAPI_SETTINGS } = global;

if (! WPAPI_SETTINGS) {
  WPAPI_SETTINGS = { endpoint: '/' };
}

const api = new WPAPI(WPAPI_SETTINGS);

export function flatten(arrOfArrs) {
  return arrOfArrs.reduce((combined, arr) => combined.concat(arr), []);
}

function noop() {}

/**
 * Take a WPRequest instance and a method to run each time a new set of results
 * is returned; iterate through pages sequentially
 *
 * @param {WPRequest} wpReq     A WPAPI request instance
 * @param {Function}  [batchCb] Callback function to call with each new batch
 * @returns {Promise} A promise that resolves to the full set of results
 */
export function all(wpReq, batchCb = noop) {
  return wpReq.then((response) => {
    batchCb(response);

    if (! (response._paging && response._paging.next)) {
      return response;
    }

    // Recurse
    return Promise.all([
      response,
      all(response._paging.next, batchCb),
    ])
      .then(responses => flatten(responses));
  });
}

// eslint-disable-next-line no-unused-vars
function getAllInParallel(resourceFactory, perRequest, perBatch, batchCb = noop) {
  // Make a new request using the provided factory method
  return resourceFactory()
    .perPage(perRequest)
    .headers()
    .then((headers) => {
      // Create an integer array of all valid pages, then split into batches
      // based on the perBatch count provided in arguments
      const pages = Array.from({
        length: headers['x-wp-totalpages'],
      }, (v, i) => i + 1);
      const batches = [];
      for (let i = 0; i < pages.length; i += perBatch) {
        batches.push(pages.slice(i, i + perBatch));
      }

      // Iterate through the batches, requesting all pages in each batch in
      // parallel and calling batchCb on each individual batch
      return batches.reduce((lastBatch, batch) => lastBatch.then((combined) => {
        function dispatchRequest(page) {
          return resourceFactory().page(page)
            .get()
            .then((posts) => {
              batchCb(posts);
              return posts;
            });
        }
        return Promise.all(batch.map(dispatchRequest))
          .then((results) => {
            const batchPosts = flatten(results);
            return combined.concat(batchPosts);
          });
      }), Promise.resolve([]));
    });
}

export function getAllPosts(batchCb) {
  return getAllInParallel(() => api.posts(), 20, 2, batchCb);
}

export function getAllCategories(batchCb) {
  return all(api.categories().perPage(5), batchCb);
}

export function getAllTags(batchCb) {
  return all(api.tags().perPage(5), batchCb);
}

export function getAllContent(batchCb) {
  return Promise.all([
    getAllPosts(batchCb),
    getAllCategories(batchCb),
    getAllTags(batchCb),
  ]);
}

/**
 * Convert a post ID to an ID string
 *
 * @param {Number} id A post ID
 * @returns {String} A resource ID string
 */
export const postId = id => `${id}`;

/**
 * Convert a term ID to an ID string
 *
 * @param {Number} id A term ID
 * @returns {String} A resource ID string
 */
export const termId = id => `t${id}`;

/**
 * Helper to avoid conflicts between post and tag IDs
 *
 * @param {Object} resource An API resource object
 * @returns {String} A resource ID string
 */
export const resourceId = ({ id, taxonomy }) => (taxonomy ? termId(id) : postId(id));

/**
 * Conform posts, tags & taxonomies to the same object shape
 *
 * Posts have IDs that are unique within Post-type objects, and a title
 * property containing an object with a `.rendered` string property;
 * categories & tags have their own IDs that may conflict with post IDs,
 * and their title is in the property `.name`.
 *
 * IDs of posts are left as-is, while IDs of categories and tags are
 * prefixed with a "t"
 *
 * @param {Object} resource An API resource object
 * @returns {Object} An object with consistent structure
 */
export function normalizeResource(resource) {
  const type = resource.type ? resource.type : resource.taxonomy;
  const title = (resource.title && resource.title.rendered) ?
    resource.title.rendered :
    resource.name;
  // Taxonomy terms will have a count of associated posts
  const count = resource.count ? resource.count : 0;
  return {
    id: resourceId(resource),
    link: resource.link,
    title,
    type,
    count,
  };
}

export const normalizedResourceShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
});
