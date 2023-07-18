import "./App.css";
import Carousel from "./Carousel";

function App() {
  const generateColorFromIndex = (index) => {
    const hue = (index * 360) / 10;
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  return (
    <div className="App">
      <Carousel>
        {Array.from(Array(10).keys()).map((item, index) => (
          <div
            key={index}
            className="carousel__item"
            style={{
              backgroundColor: generateColorFromIndex(index),
            }}
          >
            {item + 1}
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default App;
