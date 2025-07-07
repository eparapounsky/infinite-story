import request from "supertest";
import app from "../server.js";

describe("POST /story", () => {
  it("should return a story and image", async () => {
    const response = await request(app)
      .post("/story")
      .send({
        prompt: "A dragon in the mountains",
        tone: "epic",
        genre: "fantasy",
        theme: "freedom",
      })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("story");
    expect(response.body[1]).toHaveProperty("image");
  }, 50000); // extended timeout (50 secs) for OpenAI API response
});
