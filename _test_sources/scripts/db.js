var assert = require('assert');

describe('nothing', function () {
    it('should fail', function (done) {
        assert.equal(true, false);
        done();
    });
    it('should pass', function (done) {
        assert.equal(true, true);
        done();
    });
});