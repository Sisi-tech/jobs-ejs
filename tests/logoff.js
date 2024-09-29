const request = require('supertest');
const app = require("../app");

describe("User Logout Test", function() {
    before(function(done) {
        request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword' })
            .end((err, res) => {
                this.csrfToken = res.body.csrfToken;
                this.sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                done();
            });
    });

    it("should log out the user", function(done) {
        request(app)
            .post('/logout')
            .set('Cookie', this.csrfToken + ";" + this.sessionCookie)
            .send({ _csrf: this.csrfToken })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                request(app)
                    .get('/')
                    .set('Cookie', this.sessionCookie)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        res.text.should.not.contain('testuser');
                        done();
                    });
            });
    });
});
