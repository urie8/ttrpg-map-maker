import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const StyledCanvas = styled.canvas`
  margin: 0;
  padding: 0;
  display: block;
  border: 1px solid black;
  /* These CSS dimensions only affect how the canvas is displayed,
     not its internal drawing resolution. */
  width: 100px;
  height: 100px;
`;

const postData = {
  width: 100,
  height: 100,
  noisescale: 3,
};

const requestOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(postData),
};

const apiurl = "https://localhost:7085/api/Noise/generate";

const ColourfulCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Ensure the canvas is attached
    if (!canvasRef.current) {
      console.error("Canvas ref is not attached");
      return;
    }
    const canvas = canvasRef.current;

    // IMPORTANT: Set the canvas's internal drawing dimensions as numbers.
    // The element attributes (width and height) determine the drawing resolution.
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    const width = 100;
    const height = 100;
    const imageData = ctx.createImageData(width, height);

    fetch(apiurl, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Consume the response once.
      })
      .then((noise) => {
        console.log("Received noise data:", noise);
        // Make sure the noise data is in the expected format (a jagged array of numbers).
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (x + y * width) * 4;
            const value = noise[y][x]; // Note: using noise[y][x]
            imageData.data[index] = value * 255;
            imageData.data[index + 1] = value * 255;
            imageData.data[index + 2] = value * 255;
            imageData.data[index + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      })
      .catch((error) => {
        console.error("Error fetching noise data:", error);
      });
  }, []);

  return <StyledCanvas ref={canvasRef} />;
};

export default ColourfulCanvas;
