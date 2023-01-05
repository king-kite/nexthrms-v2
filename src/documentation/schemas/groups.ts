import * as refs from '../refs';

export const GroupModel = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid'
        },
        name: {
            type: 'string'
        },
        permissions: {
            type: 'array',
            items: {
                $ref: refs.PERMISSION
            }
        }
    }
}