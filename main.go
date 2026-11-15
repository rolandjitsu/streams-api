package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Counter struct {
	Count int `json:"count"`
}

type Avenger struct {
	Character string `json:"character"`
	Name      string `json:"name"`
	Founder   bool   `json:"founder"`
}

var avengers = []Avenger{
	{Character: "Iron Man", Name: "Anthony Edward 'Tony' Stark", Founder: true},
	{Character: "Thor", Name: "Thor Odinson", Founder: true},
	{Character: "Wasp", Name: "Janet van Dyne", Founder: true},
	{Character: "Ant-Man", Name: "Dr. Henry Jonathan 'Hank' Pym", Founder: true},
	{Character: "Hulk", Name: "Dr. Robert Bruce Banner", Founder: true},
}

func main() {
	e := echo.New()
	e.Use(middleware.CORS())
	e.GET("/avengers", getAvengers)
	e.GET("/counter", getCounter)

	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	go func() {
		if err := e.Start(port); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("shutting down the server: ", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}

func getAvengers(c echo.Context) error {
	ctx := c.Request().Context()

	d := c.QueryParam("delay")
	if d == "" {
		d = "1s"
	}

	t, err := time.ParseDuration(d)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid delay: "+err.Error())
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c.Response().WriteHeader(http.StatusOK)

	enc := json.NewEncoder(c.Response())
	for _, avenger := range avengers {
		select {
		case <-ctx.Done():
			return nil
		default:
			if err := enc.Encode(avenger); err != nil {
				if ctx.Err() != nil {
					return nil
				}
				return err
			}
			c.Response().Flush()

			if t > 0 {
				select {
				case <-ctx.Done():
					return nil
				case <-time.After(t):
				}
			}
		}
	}

	return nil
}

func getCounter(c echo.Context) error {
	ctx := c.Request().Context()

	d := c.QueryParam("delay")
	if d == "" {
		d = "1s"
	}

	t, err := time.ParseDuration(d)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid delay: "+err.Error())
	}

	var max int
	m := c.QueryParam("max")
	if m != "" {
		max, err = strconv.Atoi(m)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "invalid max: "+err.Error())
		}
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c.Response().WriteHeader(http.StatusOK)

	enc := json.NewEncoder(c.Response())

	var i = 0
	for {
		if max > 0 && i >= max {
			return nil
		}

		select {
		case <-ctx.Done():
			return nil
		default:
			counter := Counter{i}
			if err := enc.Encode(counter); err != nil {
				if ctx.Err() != nil {
					return nil
				}
				return err
			}
			c.Response().Flush()
			i++

			if t > 0 {
				select {
				case <-ctx.Done():
					return nil
				case <-time.After(t):
				}
			}
		}
	}
}
