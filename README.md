# Streams API

> A full-stack example demonstrating HTTP streaming with the browser [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API), [react-fetch-streams](https://github.com/rolandjitsu/react-fetch-streams), and a [Go](https://golang.org/) backend using [Echo](https://echo.labstack.com/).

[![Test](https://img.shields.io/github/actions/workflow/status/rolandjitsu/streams-api/test.yml?branch=master&label=tests&style=flat-square)](https://github.com/rolandjitsu/streams-api/actions/workflows/test.yml)

Companion project for the blog post:
**[The Streams API in JavaScript and Go](https://rolandsdev.blog/posts/the-streams-api-in-javascript-and-go/)** on Roland's Dev Blog.

---

## Features

- **Chunked HTTP Streaming**: Go backend writes and flushes JSON chunks incrementally over a single HTTP connection without buffering.
- **Client Consumption with `react-fetch-streams`**: Uses the [`react-fetch-streams`](https://github.com/rolandjitsu/react-fetch-streams) React hook library to consume streaming chunks.
- **Graceful Context Cancellation**: Server listens to client disconnects (`ctx.Done()`) to avoid wasted goroutine resources or leaking connections.
- **Interactive Demos**:
  - **Counter Stream (`/counter`)**: Real-time continuous metric stream with configurable delay and max values.
  - **Avengers Stream (`/avengers`)**: Progressive list hydration where structured hero objects appear on screen as each chunk arrives.

---

## Server (Go)

### Run Server

```bash
go run .
```

By default, the server listens on port `9000` (configurable via `PORT` environment variable):

```bash
PORT=8080 go run .
```

### Endpoints

| Endpoint | Description | Query Parameters |
|---|---|---|
| `GET /counter` | Streams an incrementing integer counter | `delay` (e.g. `500ms`, `1s`), `max` (integer) |
| `GET /avengers` | Streams a list of Avengers characters | `delay` (e.g. `500ms`, `1s`) |

### Run Tests

```bash
# Run tests
go test -v .

# Run tests without cache
go test -v -count=1 .

# Run benchmarks
go test -bench=. .

# Generate and view coverage report
go test -coverprofile=coverage.out .
go tool cover -html=coverage.out
```

---

## Client (React + Vite)

The frontend is built with **React 18** and bundled with **Vite**.

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

### Run Tests

```bash
# Run unit tests with Vitest
npm test

# Run tests with coverage
npm run test:cov
```

### Build for Production

```bash
npm run build
```

---

## License

MIT © [Roland Groza](https://github.com/rolandjitsu)
