import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // seed user
     await request(app.getHttpServer())
    .post('/auth/signup')
    .send({
      username: 'alyaa',
      email: 'aalyaaa@test.com',
      password: 'aalyaaa@12',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
     .send({
  username: 'aalyaaa',
  password: 'aalyaaa@12',
})
      .expect(200);

    expect(res.body.access_token).toBeDefined();
  });
});