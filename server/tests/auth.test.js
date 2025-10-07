const request = require('supertest');

jest.mock('../src/services/dockerService', () => ({
  startUserContainer: jest.fn(),
  stopUserContainer: jest.fn()
}));

const dockerService = require('../src/services/dockerService');
const app = require('../src/app');

describe('PagBank Auth Routes', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe('GET /pagbank/api/v1/login', () => {
    it('returns 400 when username or senha is missing', async () => {
      const response = await request(app).get('/pagbank/api/v1/login');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required/);
    });

    it('returns 401 when credentials do not match expected values', async () => {
      process.env.PAGBANK_USERNAME = 'user';
      process.env.PAGBANK_PASSWORD = 'secret';

      const response = await request(app)
        .get('/pagbank/api/v1/login')
        .query({ username: 'user', senha: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials.');
      expect(dockerService.startUserContainer).not.toHaveBeenCalled();
    });

    it('starts container and returns session data', async () => {
      dockerService.startUserContainer.mockResolvedValue({
        reused: false,
        containerName: 'pagbank-user-123',
        ports: { app: 1234, vnc: 5678 },
        startedAt: '2025-10-07T00:00:00.000Z'
      });

      const response = await request(app)
        .get('/pagbank/api/v1/login')
        .query({ username: '01796604119', senha: '130988' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Container started successfully.',
        username: '01796604119',
        container: {
          name: 'pagbank-user-123',
          ports: { app: 1234, vnc: 5678 }
        }
      });
      expect(dockerService.startUserContainer).toHaveBeenCalledWith('01796604119');
    });
  });

  describe('GET /pagbank/api/v1/logout', () => {
    it('returns 400 when username is missing', async () => {
      const response = await request(app).get('/pagbank/api/v1/logout');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/username/);
    });

    it('returns 404 when no container exists for the user', async () => {
      dockerService.stopUserContainer.mockResolvedValue({ found: false });

      const response = await request(app)
        .get('/pagbank/api/v1/logout')
        .query({ username: '01796604119' });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/No running container/);
    });

    it('stops container and returns success message', async () => {
      dockerService.stopUserContainer.mockResolvedValue({
        found: true,
        containerName: 'pagbank-user-123'
      });

      const response = await request(app)
        .get('/pagbank/api/v1/logout')
        .query({ username: '01796604119' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Container stopped and cleaned up successfully.',
        username: '01796604119',
        container: { name: 'pagbank-user-123' }
      });
      expect(dockerService.stopUserContainer).toHaveBeenCalledWith('01796604119');
    });
  });
});
