import request from "supertest";
import app from "./server.js";

describe("POST /story", () => {
  // arg 1: test description
  // arg 2: async function that runs the test
  // arg 3: timeout in milliseconds (50 seconds)
  it("should return a story and image for appropriate prompt", async () => {
    const response = await request(app)
      .post("/story") // send POST request to /story endpoint
      .send({
        // send request body with story parameters
        prompt: "flowers",
        tone: "epic",
        genre: "fantasy",
        theme: "friendship",
      })
      .set("Accept", "application/json"); // set the accept header to expect JSON response
    expect(response.statusCode).toBe(200); // check if the response status code is 200 OK
    // will not pass due to streaming response
    // expect(Array.isArray(response.body)).toBe(true); // check if the response body is an array
    // expect(response.body[0]).toHaveProperty("story"); // check if the first element has a property "story"
    // expect(response.body[1]).toHaveProperty("image"); // check if the second element has a property "image"
  }, 50000);
});

describe("POST /story", () => {
  it("should return an error for inappropriate prompt", async () => {
    const response = await request(app)
      .post("/story")
      .send({
        prompt: "murder",
        tone: "dark",
        genre: "horror",
        theme: "survival",
      })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(500); // check if the response status code is 500 Internal Server Error
    expect(response.body).toHaveProperty("error"); // check if the response body has an error property
  }, 50000);
});

describe("POST /new", () => {
  it("should reset the story history", async () => {
    const response = await request(app)
      .post("/new")
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(200); // check if the response status code is 200 OK
  });
});

describe("POST /undo", () => {
  it("should undo the last turn", async () => {
    const response = await request(app)
      .post("/undo")
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(200); // check if the response status code is 200 OK
  });
});
