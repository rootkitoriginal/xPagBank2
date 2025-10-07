const { exec } = require('node:child_process');
const { promisify } = require('node:util');
const getPortModule = require('get-port');
const getPort = typeof getPortModule === 'function' ? getPortModule : getPortModule.default;

const execAsync = promisify(exec);
const sessions = new Map();
const IMAGE_NAME = process.env.PAGBANK_IMAGE_NAME || 'pagbank-app';
const DOCKERFILE_PATH = process.env.PAGBANK_DOCKERFILE || 'Dockerfile';

let imageBuildPromise = null;

function sanitizeIdentifier(value) {
  if (!value) {
    return 'user';
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'user';
}

async function ensureImageBuilt() {
  if (!imageBuildPromise) {
    imageBuildPromise = (async () => {
      try {
        await execAsync(`docker image inspect ${IMAGE_NAME}`);
      } catch (inspectError) {
        try {
          await execAsync(`docker build -t ${IMAGE_NAME} -f ${DOCKERFILE_PATH} .`);
        } catch (buildError) {
          imageBuildPromise = null;
          const error = new Error('Failed to build Docker image');
          error.cause = buildError;
          throw error;
        }
      }
    })();
  }

  return imageBuildPromise;
}

async function startUserContainer(username) {
  await ensureImageBuilt();

  const existing = sessions.get(username);
  if (existing) {
    return { reused: true, ...existing };
  }

  const safeUsername = sanitizeIdentifier(username);
  const appPort = await getPort();
  const vncPort = await getPort({ exclude: [appPort] });
  const containerName = `${safeUsername || 'user'}-${Date.now()}`;

  try {
    await execAsync(
      `docker run -d -p ${appPort}:3000 -p ${vncPort}:6080 --name ${containerName} ${IMAGE_NAME}`
    );
  } catch (runError) {
    const error = new Error('Failed to start Docker container');
    error.cause = runError;
    throw error;
  }

  const session = {
    username,
    containerName,
    ports: { app: appPort, vnc: vncPort },
    startedAt: new Date().toISOString()
  };

  sessions.set(username, session);
  return { reused: false, ...session };
}

async function stopUserContainer(username) {
  const session = sessions.get(username);
  if (!session) {
    return { found: false };
  }

  try {
    await execAsync(`docker rm -f ${session.containerName}`);
  } catch (removeError) {
    if (!/No such container/.test(removeError.stderr || '')) {
      const error = new Error('Failed to stop Docker container');
      error.cause = removeError;
      throw error;
    }
  }

  sessions.delete(username);
  return { found: true, containerName: session.containerName };
}

function listActiveSessions() {
  return Array.from(sessions.values());
}

module.exports = {
  startUserContainer,
  stopUserContainer,
  listActiveSessions,
  _sanitizeIdentifier: sanitizeIdentifier,
  _resetState: () => {
    sessions.clear();
    imageBuildPromise = null;
  }
};
