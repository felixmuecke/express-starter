const request = require('supertest');
const app = require('../../src/app');
const httpStatus = require('http-status');
const faker = require('faker');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');

setupTestDB();

describe('/auth', () => {
  describe('POST /register', () => {
    //For all of these I need a user. Let's create a valid one and then break only the bits I want to trigger a 400 with.
    let newUser;
    beforeEach(() => {
      newUser = {
        email: faker.internet.email().toLowerCase(),
        password: 'validPassword123',
        name: faker.name.findName(),
      };
    });
    it('should return a 201, user data and tokens if request data is ok', async () => {
      const { body } = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.CREATED);

      const userInDB = await User.findOne({ email: newUser.email });
      expect(userInDB).toBeDefined();
      expect(userInDB.password).not.toBe(newUser.password);
      expect(userInDB).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        roles: [],
      });

      expect(body.user).not.toHaveProperty('password');
      expect(body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        roles: [],
      });

      expect(body.tokens).toEqual({
        accessToken: expect.anything(),
        refreshToken: expect.anything(),
      });
    });

    it('should return 400 if name is empty or missing', async () => {
      newUser.name = '';
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);

      newUser.name = null;
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if email is empty or missing', async () => {
      newUser.email = '';
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);

      newUser.email = null;
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);
    });

    it('should return 400 if password is empty or missing', async () => {
      newUser.password = '';
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);

      newUser.password = null;
      await request(app).post('/v1/auth/register').expect(httpStatus.BAD_REQUEST);
    });

    it('should return a 400 if email is invalid', async () => {
      newUser.email = 'notAnEmail';
      const { body } = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
      expect(body.message).toContain('must be a valid email');
    });

    it('should return a 400 if the email is already taken', async () => {
      await User.create({ ...newUser });
      const res = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Email already taken');
    });

    it('should return 400 if password does not match validation criteria', async () => {
      newUser.password = 'passw';
      const res = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
      expect(res.body.message).toContain('password');
    });
  });
});
