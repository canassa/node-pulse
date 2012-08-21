var assert = require('assert'),
    s = require('../server.js'),
    _ = require('lodash');


describe('Concat posts', function () {
    it('should concat the input array', function () {
        assert.deepEqual([1,2,3,"a","b","c",4,5,6], s.concat_posts([[1,2,3], ['a','b','c'], [4,5,6]]));
    })

    it('should sort the array using the "create" property', function () {
        var input = [
            [
                {i: 1, created: new Date(10)},
                {i: 2, created: new Date(30)},
                {i: 3, created: new Date(22)}
            ],
            [
                {i: 4, created: new Date(1)},
                {i: 5, created: new Date(3)},
                {i: 6, created: new Date(2)}
            ],
            [
                {i: 7, created: new Date(100)},
                {i: 8, created: new Date(300)},
                {i: 9, created: new Date(222)}
            ],
        ];

        assert.deepEqual([8,9,7,2,3,1,5,6,4], _.pluck(s.concat_posts(input), 'i'));
    })


    it('should not return more than 50 elements', function () {
        assert.equal(50, s.concat_posts(_.range(100)).length);
    })
})