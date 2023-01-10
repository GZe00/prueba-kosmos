import React, { useRef, useState } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const [images, setImages] = React.useState(null);


  React.useEffect(() => {
    // Obtain the images only once
    fetch('https://jsonplaceholder.typicode.com/photos').then((response) => {
      response.json().then(data => {
        setImages({
          current: 1,
          data: data
        });
      })
    });
  }, [])

  const addMoveable = async () => {
    /* 
      Create a new moveable component and add it to the array,
      assign an available image according to the last position
    */
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    let image;
    if (images) {
      image = images.data[images.current].url;
      setImages({ ...images, current: images.current + 1 });
    }

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        image: image,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {

    /* 
      Updates the state variable values when moving the div tag
    */

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };


  const updateMoveableEnd = (item) => {

    /* 
      When dragging the div tag finishes, it updates the position values of the div tag to prevent them from having different positions
    */

    const updatedMoveableEnd = moveableComponents.map((moveable) => {
      if (moveable.id === item.id) {
        return {
          ...moveable,
          left: item.left,
          top: item.top
        };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveableEnd);
  };


  const handleResizeStart = (e) => {
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {

      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateEnd={(values) => updateMoveableEnd(values, item)}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  image,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // Update width and height
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // Update reference node
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {

    /* 
      Updates the state variable values when moving the div tag
    */

    let newWidth = e.lastEvent.width ?? 0;
    let newHeight = e.lastEvent.height ?? 0;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;


    const absoluteTop = top;
    const absoluteLeft = left;

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  const handleKeyDown = (e) => {
    console.log('keyDown')
    console.log(e)
  }

  return (
    <>
      <div
        ref={ref}
        tabIndex={index}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top,
          left,
          width,
          height,
          background: color
        }}
        onClick={() => setSelected(id)}
      />
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        edgeDraggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onDragEnd={updateEnd}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["n", "nw", "ne", "s", "se", "sw", "e", "w"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
