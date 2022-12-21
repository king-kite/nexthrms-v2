import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

import { clientExample, clientProperties } from './clients';

const path = {
  get: {
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      ...responses,
      '200': {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: refs.BASE },
                {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: refs.CLIENT,
                    },
                  },
                },
              ],
            },
          },
        },
        description: 'Get Single Client Information',
      },
      '404': {
        content: {
          'application/json': {
            schema: {
              $ref: refs.BASE,
            },
          },
        },
      },
    },
    summary: 'Get Single Client',
    tags: [tags.Clients],
  },
  put: {
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                format: 'base64',
              },
              form: {
                type: 'object',
                required: ['company', 'position'],
                properties: {
                  ...clientProperties,
                  contactId: {
                    type: 'string',
                    format: 'uuid',
                    nullable: true,
                  },
                },
                example: {
                  ...clientExample,
                  contactId: null,
                },
              },
            },
          },
          encoding: {
            image: {
              contentType: 'image/*',
            },
          },
        },
      },
    },
    responses: {
      ...responses,
      '200': {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: refs.BASE },
                {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: refs.CLIENT,
                    },
                  },
                },
              ],
            },
          },
        },
      },
      '400': {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: refs.BASE },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        firstName: {
                          type: 'string',
                          nullable: true,
                        },
                        lastName: {
                          type: 'string',
                          nullable: true,
                        },
                        email: {
                          type: 'string',
                          nullable: true,
                        },
                        phone: {
                          type: 'string',
                          nullable: true,
                        },
                        image: {
                          type: 'string',
                          nullable: true,
                        },
                        gender: {
                          type: 'string',
                          nullable: true,
                        },
                        address: {
                          type: 'string',
                          nullable: true,
                        },
                        state: {
                          type: 'string',
                          nullable: true,
                        },
                        city: {
                          type: 'string',
                          nullable: true,
                        },
                        contactId: {
                          type: 'string',
                          nullable: true,
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    summary: 'Updated Single Client',
    tags: [tags.Clients],
  },
  delete: {
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      ...responses,
      '200': {
        content: {
          'application/json': {
            schema: {
              $ref: refs.BASE,
            },
          },
        },
      },
    },
    summary: 'Delete Single Client',
    tags: [tags.Clients],
  },
};

export default path;
