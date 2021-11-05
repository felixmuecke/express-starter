const request = require('supertest');
const app = require('../../src/app');
const httpStatus = require('http-status');
const faker = require('faker');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');

setupTestDB();

describe('/auth', () => {
  describe('POST /register', () => {
    const path = '/v1/auth/register';

    const getValidUser = () => {
      return {
        email: faker.internet.email().toLowerCase(),
        password: 'validPassword123',
        name: faker.name.findName(),
      };
    };

    let newUser;
    beforeEach(() => {
      newUser = getValidUser();
    });

    it('should return a 201, user data and tokens if request data is ok', async () => {
      const { body } = await request(app).post(path).send(newUser).expect(httpStatus.CREATED);

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

    it('should return a 400 if the email is already taken', async () => {
      await User.create(newUser);
      const res = await request(app).post(path).send(newUser).expect(httpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Email already taken');
    });

    it('should return 400 if one of the validation criteria is not met', async () => {
      const expectBadRequest = async (newUser) => {
        await request(app).post(path).send(newUser).expect(httpStatus.BAD_REQUEST);
      };

      newUser.email = '';
      await expectBadRequest(newUser);
      newUser.email = null;
      await expectBadRequest(newUser);
      newUser.email = 'invalidEmail';
      await expectBadRequest(newUser);

      newUser = getValidUser();

      newUser.password = '';
      await expectBadRequest(newUser);
      newUser.password = null;
      await expectBadRequest(newUser);
      newUser.password = 'pass';
      await expectBadRequest(newUser);

      newUser = getValidUser();

      newUser.name = '';
      await expectBadRequest(newUser);
      newUser.name = null;
      await expectBadRequest(newUser);
    });
  });

  describe('POST /login', () => {
    const path = '/v1/auth/login';
    let credentials;
    beforeEach(() => {
      credentials = {
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
      };
    });

    it('should send back a 200, user and tokens if credentials are correct', async () => {
      const user = {
        ...credentials,
        name: faker.name.findName(),
      };
      await User.create(user);

      const { body } = await request(app).post(path).send(credentials).expect(httpStatus.OK);
      expect(body.user).toEqual({
        id: expect.anything(),
        name: user.name,
        email: user.email,
        roles: [],
      });

      expect(body.tokens).toEqual({
        accessToken: expect.anything(),
        refreshToken: expect.anything(),
      });
    });

    it('should return 401 if the a user with this email does not exist', async () => {
      await request(app).post(path).send(credentials).expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 if the password is incorrect', async () => {
      await User.create({
        ...credentials,
        name: faker.name.findName(),
      });
      credentials.password = 'validButWrongPassword123';
      await request(app).post(path).send(credentials).expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 400 if one of the validation criteria is not met', async () => {
      const expectBadRequest = async (credentials) => {
        await request(app).post(path).send(credentials).expect(httpStatus.BAD_REQUEST);
      };

      credentials.email = '';
      await expectBadRequest(credentials);
      credentials.email = null;
      await expectBadRequest(credentials);
      credentials.email = 'invalidEmail';
      await expectBadRequest(credentials);
      credentials.email = faker.internet.email().toLowerCase();

      credentials.password = '';
      await expectBadRequest(credentials);
      credentials.password = null;
      await expectBadRequest(credentials);
      credentials.password = 'pass';
      await expectBadRequest(credentials);
    });
  });
});
