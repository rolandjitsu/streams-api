// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add support for fetch()
// import 'isomorphic-fetch';

// Add support for ReadableStream and friends
// https://github.com/MattiasBuelens/web-streams-polyfill
import "web-streams-polyfill/es2018";

// Config fetch-mock
import {config} from 'fetch-mock';
config.Headers = Headers;
config.Request = Request;
config.Response = Response;
config.Promise = Promise;
