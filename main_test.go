package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/labstack/echo/v4"
)

func TestGetAvengers(t *testing.T) {
	e := echo.New()
	q := make(url.Values)
	q.Set("delay", "1ms")

	req := httptest.NewRequest(http.MethodGet, "/avengers?"+q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if assert.NoError(t, getAvengers(c)) {
		assert.Equal(t, `{"character":"Iron Man","name":"Anthony Edward 'Tony' Stark","founder":true}
{"character":"Thor","name":"Thor Odinson","founder":true}
{"character":"Wasp","name":"Janet van Dyne","founder":true}
{"character":"Ant-Man","name":"Dr. Henry Jonathan 'Hank' Pym","founder":true}
{"character":"Hulk","name":"Dr. Robert Bruce Banner","founder":true}
`, rec.Body.String())
	}
}

func TestGetAvengersContextCancel(t *testing.T) {
	e := echo.New()
	ctx, cancel := context.WithCancel(context.Background())
	q := make(url.Values)
	q.Set("delay", "100ms")

	req := httptest.NewRequest(http.MethodGet, "/avengers?"+q.Encode(), nil)
	req = req.WithContext(ctx)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	go func() {
		time.Sleep(30 * time.Millisecond)
		cancel()
	}()

	err := getAvengers(c)
	assert.NoError(t, err)
	// Should have cancelled gracefully before sending all avengers
	assert.Contains(t, rec.Body.String(), `{"character":"Iron Man"`)
	assert.NotContains(t, rec.Body.String(), `{"character":"Hulk"`)
}

func TestGetCounter(t *testing.T) {
	e := echo.New()

	ctx, cancel := context.WithCancel(context.Background())
	q := make(url.Values)
	q.Set("delay", "10ms")

	req := httptest.NewRequest(http.MethodGet, "/counter?"+q.Encode(), nil)
	req = req.WithContext(ctx)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	go func() {
		time.Sleep(15 * time.Millisecond)
		cancel()
	}()

	if assert.NoError(t, getCounter(c)) {
		assert.Equal(t, `{"count":0}
{"count":1}
`, rec.Body.String())
	}
}

func TestGetCounterMax(t *testing.T) {
	e := echo.New()
	q := make(url.Values)
	q.Set("delay", "1ms")
	q.Set("max", "10")

	req := httptest.NewRequest(http.MethodGet, "/counter?"+q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if assert.NoError(t, getCounter(c)) {
		assert.Equal(t, `{"count":0}
{"count":1}
{"count":2}
{"count":3}
{"count":4}
{"count":5}
{"count":6}
{"count":7}
{"count":8}
{"count":9}
`, rec.Body.String())
	}
}

func TestGetCounterInvalidParams(t *testing.T) {
	e := echo.New()

	// Invalid delay
	q := make(url.Values)
	q.Set("delay", "invalid")
	req := httptest.NewRequest(http.MethodGet, "/counter?"+q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	assert.Error(t, getCounter(c))

	// Invalid max
	q = make(url.Values)
	q.Set("max", "notanumber")
	req = httptest.NewRequest(http.MethodGet, "/counter?"+q.Encode(), nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	assert.Error(t, getCounter(c))
}
