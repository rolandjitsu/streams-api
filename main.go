package main

import (
	"encoding/json"
	"net/http"
	"strconv"
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
	e.Logger.Fatal(e.Start(":9000"))
}

func getAvengers(c echo.Context) error {
	d := c.QueryParam("delay")
	if d == "" {
		d = "1s"
	}

	t, err := time.ParseDuration(d)
	if err != nil {
		return err
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c.Response().WriteHeader(http.StatusOK)

	enc := json.NewEncoder(c.Response())
	for _, avenger := range avengers {
		if err := enc.Encode(avenger); err != nil {
			return err
		}
		c.Response().Flush()
		time.Sleep(t)
	}

	return c.NoContent(http.StatusOK)
}

func getCounter(c echo.Context) error {
	ctx := c.Request().Context()

	d := c.QueryParam("delay")
	if d == "" {
		d = "1s"
	}

	t, err := time.ParseDuration(d)
	if err != nil {
		return err
	}

	var max int
	m := c.QueryParam("max")
	if m != "" {
		max, err = strconv.Atoi(m)
		if err != nil {
			return err
		}
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c.Response().WriteHeader(http.StatusOK)

	enc := json.NewEncoder(c.Response())

	var i = 0
	for {
		if max > 0 && i >= max {
			return c.NoContent(http.StatusOK)
		}

		select {
		case <-ctx.Done():
			return c.NoContent(http.StatusOK)
		default:
			counter := Counter{i}
			if err := enc.Encode(counter); err != nil {
				return err
			}
			c.Response().Flush()
			time.Sleep(t)
			i++
		}
	}
}
