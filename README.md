# Streams API
> A simple example of using the [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/rolandjitsu/streams-api/Test?label=tests&style=flat-square)](https://github.com/rolandjitsu/streams-api/actions?query=workflow%3ATest)

## Client
The app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To start the app server run:
```bash
yarn start
```

The above runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

To start the tests in interactive mode run:
```bash
yarn test
```

## Server
To run the server run:
```bash
go run ./main.go
```

To run tests run:
```bash
go test .
```

To avoid caching during tests use:
```bash
go test -count=1 .
```

To run benchmark tests use the `-bench` flag:
```bash
go test -bench=. .
```

To get coverage reports use the `-cover` flag:
```bash
go test -coverprofile=coverage.out .
```

And to view the profile run:
```bash
go tool cover -html=coverage.out
```
