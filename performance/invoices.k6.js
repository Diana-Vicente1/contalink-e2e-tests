import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://candidates-api.contalink.com';
const ACCESS_CODE = __ENV.ACCESS_CODE;

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 10,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  if (!ACCESS_CODE) {
    throw new Error('ACCESS_CODE environment variable is required');
  }

  const response = http.get(`${BASE_URL}/V1/invoices`, {
    headers: {
      authorization: ACCESS_CODE,
      accept: 'application/json',
    },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'response has invoices field': (res) => {
      const body = res.json();
      return Object.prototype.hasOwnProperty.call(body, 'invoices');
    },
    'response has pagination field': (res) => {
      const body = res.json();
      return Object.prototype.hasOwnProperty.call(body, 'pagination');
    },
  });

  sleep(1);
}