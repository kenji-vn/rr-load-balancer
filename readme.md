# Simple Load Balancer

### About

Demo a simple load balancer written in TypeScript/Nodejs.

Features:

- Distribute requests to all workers using a round-robin approach.
- Workers auto join the load balancer.
- The load balancer monitors all workers, removes slow or dead workers, and adds them back when they are healthy.

### Local setup and testing

- The machine should have Nodejs (18 or 20) and npm (npm comes with Nodejs)

Run these commands from the root directory.
1. To install all dependencies: `npm install`
2. To build
    `npm run build`
3. To start the gateway (load balancer) in port 3000: 
    `npm run gateway`
    
    http://localhost:3000/

4. To start a worker, with a random port from 3001 - 3999: 
    `npm run worker`

    http://localhost:[port]/ 

    (see console for the link)
5. After you start the worker, it will auto join the gateway. 

   If you stop the worker, it will get removed from the gateway.

6. Testing example:
    
    - Send a POST to the gateway (http://localhost:3000/) with a body {"message":"Hello World"}
    - After you get the response, check the HTTP response header field "server", it is the actual worker that handled the request.

7. To run unit tests
    `npm run test`
   

### Reading the code  

1. Project is written in TypeScript/Nodejs using [Fastify framework.](https://www.fastify.io)
2. Main code files:

- `src/services/load-balancer.ts`
    - The main class, has all features of this demo load balancer.
- `src/services/round-robin-selector.ts`
    - The select algorithm used in load-balancer.ts  
- `src/controllers/gateway-controller.ts`
    - 1 endpoint to let worker join the gateway ("/join")
    - 1 endpoint to receive all POST requests from users, then distribute requests to workers.
- `src/controllers/worker-controller.ts`
    - 1 endpoint to handle the work ("/")
    - 1 endpoint to receive health check from the gateway ("/health")
- `src/test/**`
    - unit tests of this project
