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
	c.SetParamNames()

	if assert.NoError(t, getAvengers(c)) {
		assert.Equal(t, `{"character":"Iron Man","name":"Anthony Edward 'Tony' Stark","founder":true}
{"character":"Thor","name":"Thor Odinson","founder":true}
{"character":"Wasp","name":"Janet van Dyne","founder":true}
{"character":"Ant-Man","name":"Dr. Henry Jonathan 'Hank' Pym","founder":true}
{"character":"Hulk","name":"Dr. Robert Bruce Banner","founder":true}
`, rec.Body.String())
	}
}

func TestGetCounter(t *testing.T) {
	e := echo.New()

	ctx, cancel := context.WithCancel(context.Background())
	req := httptest.NewRequest(http.MethodGet, "/counter", nil)
	req = req.WithContext(ctx)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames()

	go func() {
		time.Sleep(1500 * time.Millisecond)
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
	c.SetParamNames()

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
