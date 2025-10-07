# PagBank Container Orchestrator API

This project consists of two main components:

1. **Container Orchestrator** (`/src`): Express.js API that manages Docker containers for PagBank user sessions, handling container lifecycle and port mapping.
2. **Container Application** (`/container`): Node.js application that runs inside each Docker container, providing a web interface accessible through Express and noVNC.

## Project Structure

- `/src` - Container orchestrator (runs on host)
  - Manages container lifecycle (start/stop)
  - Handles user authentication
  - Maps container ports to host
  
- `/container` - Application running inside containers
  - Express.js web application
  - Fluxbox window manager
  - noVNC for browser-based VNC access

## Requirements

- Node.js 18+
- Docker Engine with permission to run `docker build` and `docker run`
- Git (for cloning the repository)

## Installation

### 1. Build the Docker Image

First, build the Docker image that contains the Node.js application, noVNC, and Fluxbox:

```bash
# Build the image with tag 'pagbank-app'
docker build -t pagbank-app .

# Verify the image was created
docker images | grep pagbank-app
```

The build process:
- Sets up Node.js environment
- Installs noVNC stack (Xvfb, Fluxbox, x11vnc)
- Configures supervisord for process management
- Installs the container application

The build process:

- Sets up Node.js environment
- Installs noVNC stack (Xvfb, Fluxbox, x11vnc)
- Configures supervisord for process management
- Installs the container application

### 2. Install Orchestrator Dependencies

```bash
# Install orchestrator dependencies
npm install

# Install container application dependencies
cd container && npm install && cd ..
```

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PAGBANK_USERNAME` | _unset_ | Optional credentials gate for login/logout requests. |
| `PAGBANK_PASSWORD` | _unset_ | Optional password gate for login requests. |
| `PAGBANK_IMAGE_NAME` | `pagbank-app` | Docker image tag built/started for each user session. |
| `PAGBANK_DOCKERFILE` | `Dockerfile` | Path to Dockerfile used when building the image. |

If credentials are left unset, any username/password combination is accepted.

## Running the API

Build the Docker image automatically on first login:

```bash
npm start
```

The server defaults to port `4000`. Override with `PORT` if needed.

### Endpoints

- `GET /pagbank/api/v1/login?username=USER&senha=PASSWORD`
  - Validates credentials (if configured).
  - Builds the Docker image (if needed).
  - Starts a container on random host ports (Express on 8000, noVNC on 6080 inside the container).

- `GET /pagbank/api/v1/logout?username=USER`
  - Stops and removes the container tracked for that user.

Responses include container name, bound ports, and status messages. Missing or invalid parameters return `4xx` errors.

## Testing

```bash
npm test -- --runInBand
```

The suite mocks Docker interactions and verifies authentication, success, and teardown flows.

## Container Architecture

### Container Image Structure

The container image includes:

- Node.js application from `/container` directory
- noVNC stack:
  - Xvfb (Virtual framebuffer)
  - Fluxbox (Window Manager)
  - x11vnc (VNC Server)
  - websockify (WebSocket to VNC bridge)
- Supervisor to manage all processes

### Container Ports

- 3000: Express.js application
- 6080: noVNC web interface
- 5900: VNC server (internal)

### Testing the Container

You can test the container directly after building:

```bash
# Start the container with mapped ports
docker run -d -p 3000:3000 -p 6080:6080 --name test-pagbank pagbank-app

# Check if container is running
docker ps | grep test-pagbank

# View container logs
docker logs test-pagbank

# Access the applications:
# - Node.js app: http://localhost:3000
# - noVNC interface: http://localhost:6080
```

### Container Startup Process

1. Supervisor starts all services (`supervisord.conf`)
2. Xvfb creates virtual display
3. Fluxbox window manager starts on virtual display
4. x11vnc provides VNC access to display
5. websockify enables browser-based VNC access
6. Node.js application starts on port 3000

## Troubleshooting

### Building Issues

- **noVNC installation fails**: Check network connectivity to GitHub
- **Permission errors**: Ensure Docker has proper permissions
- **Port conflicts**: Make sure ports 3000 and 6080 are available

### Runtime Issues

- Container logs: `docker logs <container_id>`
- Process status: `docker exec <container_id> supervisorctl status`
- VNC issues: Check if x11vnc is running with `docker exec <container_id> ps aux | grep x11vnc`

- Container logs: `docker logs <container_id>`
- VNC connection issues: Check if Xvfb and x11vnc are running in container
- Web access issues: Verify mapped ports with `docker ps`
- Container state: Use `docker exec <container_id> supervisorctl status`
