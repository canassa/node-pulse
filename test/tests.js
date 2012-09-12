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


describe('Filter bad words', function () {
    it('should remove posts with bad words', function () {
        var list = [{message: 'merda frita'}]
        list = s.filter_bad_words(list, ['merda']);
        assert.equal(0, list.length);
    })

    it('should not remove a post if it doesnt contain a bad word', function () {
        var list = [{message: 'teste'}]
        list = s.filter_bad_words(list, ['merda']);
        assert.equal(1, list.length);
    })

    it('should only remove ofensive messages', function () {
        var list = [{message: 'merda'}, {message: 'teste'}]
        list = s.filter_bad_words(list, ['merda']);
        assert.equal(1, list.length);
        assert.equal('teste', list[0].message);
    })

    it('should remove multiple bad words', function () {
        var list = [{message: 'Hello word'},
                    {message: 'merda'},
                    {message: 'bosta'},
                    {message: 'caralho'},
                    {message: 'Oi gente'},
                    {message: 'hello caralho bosta'}]

        list = s.filter_bad_words(list, ['merda', 'bosta', 'caralho']);
        assert.equal(2, list.length);
        assert.equal('Hello word', list[0].message);
        assert.equal('Oi gente', list[1].message);
    })

    it('should be case insensitive', function () {
        var list = [{message: 'MERDA'}, {message: 'Merda'}]
        list = s.filter_bad_words(list, ['merda']);
        assert.equal(0, list.length);
    })

    it('should ignore accents', function () {
        var list = [{message: 'mérda'}, {message: 'merda'}]
        list = s.filter_bad_words(list, ['merda']);
        assert.equal(0, list.length);
    })
})

describe('Remove diacritics', function () {
    it('should remove all accents', function () {
        assert.equal('aeiouaeiouaeiouaeiou', s.remove_diacritics('ãeiõuáéíóúàèìòùâêîôû'));
    })
})